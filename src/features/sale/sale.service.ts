import { Injectable } from '@nestjs/common';
import Big from 'big.js';
import dayjs from 'dayjs';
import { InferSelectModel } from 'drizzle-orm';
import { mainEntities } from '../../database/main/main-entities';
import { SaleRepository } from '../../database/main/repositories/sale.repository';
import { CustomerReadService } from '../customer/customer-read.service';
import { EmployeeReadService } from '../employee/employee-read.service';
import { CatalogItemReadService } from '../catalog-item/catalog-item-read.service';
import { AppointmentReadService } from '../appointment/appointment-read.service';
import { CreateSaleDto } from './dto/input/create-sale.request';
import { CreateSaleResDto } from './dto/output/create-sale.response';
import { AddSaleTransactionDto } from './dto/input/add-sale-transaction.request';
import { AddSaleTransactionResDto } from './dto/output/add-sale-transaction.response';
import { UpdateSaleStatusDto } from './dto/input/update-sale-status.request';
import { FilterSaleDto } from './dto/input/list-sale.request';
import { GetSaleResDto } from './dto/output/get-sale.response';
import { SaleItemModel, SaleTransactionModel } from './model/sale.model';
import { SaleExceptions } from './sale-exceptions';
import { coreExceptions } from '../../core/core-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { SaleStatus } from '../../shared/domain/sale-status.enum';
import { SaleTransactionType } from '../../shared/domain/sale-transaction-type.enum';
import { AppointmentStatus } from '../../shared/domain/appointment-staus.enum';
import { PaymentMethod } from '../../shared/domain/payment-method.enum';

interface ResolvedSaleItem {
  catalogItemId: string;
  catalogItemName: string;
  quantity: number;
  priceApplied: string;
}

interface TransactionForStatus {
  type: SaleTransactionType;
  amount: string;
  receivedAt?: Date | null;
}

@Injectable()
export class SaleService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly customerReadService: CustomerReadService,
    private readonly employeeReadService: EmployeeReadService,
    private readonly catalogItemReadService: CatalogItemReadService,
    private readonly appointmentReadService: AppointmentReadService,
  ) {}

  @MainTransactional()
  async create(dto: CreateSaleDto): Promise<CreateSaleResDto> {
    const [customer, employee, appointment] = await Promise.all([
      this.customerReadService.requireWithPerson(dto.customerId),
      this.employeeReadService.requireWithPerson(dto.employeeId),
      dto.appointmentId
        ? this.appointmentReadService.requireWithItems(dto.appointmentId)
        : undefined,
    ]);

    if (appointment && appointment.status !== AppointmentStatus.COMPLETED) {
      throw SaleExceptions.saleAppointmentNotCompleted([
        {
          field: 'appointmentId',
          issue: `appointment status is '${appointment.status}', expected '${AppointmentStatus.COMPLETED}'`,
        },
      ]);
    }

    const items = await this.resolveItems(dto.items, appointment);
    const totalAmount = this.sumMoney(
      items.map((item) => this.multiplyMoney(item.priceApplied, item.quantity)),
    );

    const transactionsInput = (dto.transactions ?? []).flatMap((entry) =>
      this.expandTransactionEntry(entry, { allowRefund: false }),
    );
    const status = this.deriveStatus(transactionsInput, totalAmount);

    const sale = await this.saleRepository.insert({
      customerId: dto.customerId,
      employeeId: dto.employeeId,
      appointmentId: dto.appointmentId,
      status,
      totalAmount,
    });

    const catalogItemNameById = new Map(
      items.map((item) => [item.catalogItemId, item.catalogItemName]),
    );
    const [insertedItems, insertedTransactions] = await Promise.all([
      this.saleRepository.insertItems(
        sale.id,
        items.map((item) => ({
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          priceApplied: item.priceApplied,
        })),
      ),
      this.saleRepository.insertTransactions(sale.id, transactionsInput),
    ]);

    return {
      id: sale.id,
      status: sale.status,
      totalAmount: sale.totalAmount,
      customerId: customer.id,
      customerName: customer.person.name,
      employeeId: employee.id,
      employeeName: employee.person.name,
      appointmentId: sale.appointmentId ?? undefined,
      items: insertedItems.map((entity) =>
        this.mapItemEntityToModel(
          entity,
          catalogItemNameById.get(entity.catalogItemId)!,
        ),
      ),
      transactions: insertedTransactions.map((entity) =>
        this.mapTransactionEntityToModel(entity),
      ),
    };
  }

  @MainTransactional()
  async addTransaction(
    saleId: string,
    dto: AddSaleTransactionDto,
  ): Promise<AddSaleTransactionResDto> {
    const sale = await this.require(saleId);
    if (sale.status === SaleStatus.CANCELLED) {
      throw SaleExceptions.saleTerminalStatus([
        {
          field: 'status',
          issue: `cannot add a transaction to a sale with status '${sale.status}'`,
        },
      ]);
    }

    const newTransactionsInput = this.expandTransactionEntry(dto, {
      allowRefund: true,
    });
    const existingTransactions =
      await this.saleRepository.findTransactionsBySaleId(saleId);
    this.assertRefundsDoNotExceedPayments([
      ...existingTransactions,
      ...newTransactionsInput,
    ]);

    const insertedTransactions = await this.saleRepository.insertTransactions(
      saleId,
      newTransactionsInput,
    );
    const allTransactions = [...existingTransactions, ...insertedTransactions];
    const status = this.deriveStatus(allTransactions, sale.totalAmount);
    if (status !== sale.status) {
      await this.saleRepository.update(saleId, { status });
    }

    return {
      transactions: insertedTransactions.map((entity) =>
        this.mapTransactionEntityToModel(entity),
      ),
      saleStatus: status,
    };
  }

  @MainTransactional()
  async updateStatus(id: string, dto: UpdateSaleStatusDto) {
    const sale = await this.require(id);
    if (dto.status === sale.status) {
      return;
    }
    if (
      sale.status !== SaleStatus.PENDING ||
      dto.status !== SaleStatus.CANCELLED
    ) {
      throw SaleExceptions.saleInvalidStatusTransition([
        {
          field: 'status',
          issue: `cannot transition from '${sale.status}' to '${dto.status}'`,
        },
      ]);
    }
    await this.saleRepository.update(id, { status: dto.status });
  }

  @MainTransactional()
  async delete(id: string) {
    await this.require(id);
    await this.saleRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterSaleDto) {
    const { sales, count } = await this.saleRepository.findPaginated(dto);
    return {
      sales: sales.map((sale) => ({
        ...sale,
        appointmentId: sale.appointmentId ?? undefined,
      })),
      count,
    };
  }

  @MainTransactional()
  async require(id: string) {
    const sale = await this.saleRepository.findFirstById(id);
    if (!sale) {
      throw SaleExceptions.saleNotFound([
        { field: 'saleId', issue: `not found with value '${id}'` },
      ]);
    }
    return sale;
  }

  @MainTransactional()
  async requireWithDetails(id: string): Promise<GetSaleResDto> {
    const sale = await this.saleRepository.findFirstByIdWithDetails(id);
    if (!sale) {
      throw SaleExceptions.saleNotFound([
        { field: 'saleId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: sale.id,
      status: sale.status,
      totalAmount: sale.totalAmount,
      customerId: sale.customerId,
      customerName: sale.customer.person.name,
      employeeId: sale.employeeId,
      employeeName: sale.employee.person.name,
      appointmentId: sale.appointmentId ?? undefined,
      items: sale.saleItems.map((item) =>
        this.mapItemEntityToModel(item, item.catalogItem.name),
      ),
      transactions: sale.saleTransactions.map((transaction) =>
        this.mapTransactionEntityToModel(transaction),
      ),
    };
  }

  private async resolveItems(
    dtoItems: CreateSaleDto['items'],
    appointment:
      | Awaited<ReturnType<AppointmentReadService['requireWithItems']>>
      | undefined,
  ): Promise<ResolvedSaleItem[]> {
    const baseItems = dtoItems?.length
      ? dtoItems
      : appointment
        ? appointment.appointmentItems.map((item) => ({
            catalogItemId: item.catalogItemId,
            quantity: item.quantity,
            priceApplied: item.priceApplied,
          }))
        : undefined;

    if (!baseItems || !baseItems.length) {
      throw coreExceptions.invalidRequest([
        { field: 'items', issue: 'items are required' },
      ]);
    }

    const catalogItems = await this.catalogItemReadService.requireMany(
      baseItems.map((item) => item.catalogItemId),
    );
    const catalogItemById = new Map(
      catalogItems.map((catalogItem) => [catalogItem.id, catalogItem]),
    );

    return baseItems.map((item) => {
      const catalogItem = catalogItemById.get(item.catalogItemId)!;
      const priceApplied = item.priceApplied ?? catalogItem.defaultPrice;
      if (!priceApplied) {
        throw coreExceptions.invalidRequest([
          {
            field: 'priceApplied',
            issue: `catalog item '${item.catalogItemId}' has no default price; priceApplied must be provided`,
          },
        ]);
      }
      return {
        catalogItemId: item.catalogItemId,
        catalogItemName: catalogItem.name,
        quantity: item.quantity,
        priceApplied,
      };
    });
  }

  private expandTransactionEntry(
    entry: AddSaleTransactionDto,
    options: { allowRefund: boolean },
  ) {
    if (entry.installmentCount) {
      if (
        entry.paymentMethod !== PaymentMethod.CREDIT_CARD ||
        entry.type !== SaleTransactionType.PAYMENT
      ) {
        throw SaleExceptions.saleInstallmentRequiresCreditCardPayment([
          {
            field: 'paymentMethod',
            issue: `installment plans require type '${SaleTransactionType.PAYMENT}' and paymentMethod '${PaymentMethod.CREDIT_CARD}'`,
          },
        ]);
      }
      if (!entry.dueDate) {
        throw coreExceptions.invalidRequest([
          {
            field: 'dueDate',
            issue:
              'dueDate (first installment due date) is required for an installment plan',
          },
        ]);
      }
      return this.generateInstallmentTransactions({
        paymentMethod: entry.paymentMethod,
        amount: entry.amount,
        installmentCount: entry.installmentCount,
        firstDueDate: entry.dueDate,
        markFirstInstallmentAsReceived: entry.markFirstInstallmentAsReceived,
      });
    }

    if (!options.allowRefund && entry.type === SaleTransactionType.REFUND) {
      throw SaleExceptions.saleRefundNotAllowedAtCreation([
        {
          field: 'type',
          issue: `transaction type '${entry.type}' is not allowed at sale creation`,
        },
      ]);
    }

    return [
      {
        type: entry.type,
        paymentMethod: entry.paymentMethod,
        amount: entry.amount,
        dueDate: entry.dueDate,
        receivedAt: entry.receivedAt,
      },
    ];
  }

  private generateInstallmentTransactions(plan: {
    paymentMethod: PaymentMethod;
    amount: string;
    installmentCount: number;
    firstDueDate: Date;
    markFirstInstallmentAsReceived: boolean;
  }) {
    const baseAmount = new Big(plan.amount)
      .div(plan.installmentCount)
      .round(2, Big.roundDown);
    const lastAmount = new Big(plan.amount).minus(
      baseAmount.times(plan.installmentCount - 1),
    );

    return Array.from({ length: plan.installmentCount }, (_, index) => {
      const installmentNumber = index + 1;
      const isLastInstallment = installmentNumber === plan.installmentCount;
      return {
        type: SaleTransactionType.PAYMENT,
        paymentMethod: plan.paymentMethod,
        amount: (isLastInstallment ? lastAmount : baseAmount).toFixed(2),
        installmentNumber,
        installmentCount: plan.installmentCount,
        dueDate: dayjs(plan.firstDueDate).add(index, 'month').toDate(),
        receivedAt:
          installmentNumber === 1 && plan.markFirstInstallmentAsReceived
            ? new Date()
            : undefined,
      };
    });
  }

  private deriveStatus(
    transactions: TransactionForStatus[],
    totalAmount: string,
  ): SaleStatus {
    if (
      transactions.some(
        (transaction) => transaction.type === SaleTransactionType.REFUND,
      )
    ) {
      return SaleStatus.REFUNDED;
    }
    const confirmedPaid = this.sumMoney(
      transactions
        .filter(
          (transaction) =>
            transaction.type === SaleTransactionType.PAYMENT &&
            transaction.receivedAt,
        )
        .map((transaction) => transaction.amount),
    );
    if (Big(confirmedPaid).gte(totalAmount)) {
      return SaleStatus.PAID;
    }
    return SaleStatus.PENDING;
  }

  private assertRefundsDoNotExceedPayments(
    transactions: TransactionForStatus[],
  ) {
    const confirmedPaid = this.sumMoney(
      transactions
        .filter(
          (transaction) =>
            transaction.type === SaleTransactionType.PAYMENT &&
            transaction.receivedAt,
        )
        .map((transaction) => transaction.amount),
    );
    const totalRefunded = this.sumMoney(
      transactions
        .filter(
          (transaction) => transaction.type === SaleTransactionType.REFUND,
        )
        .map((transaction) => transaction.amount),
    );
    if (Big(totalRefunded).gt(confirmedPaid)) {
      throw SaleExceptions.saleRefundExceedsPaidAmount([
        {
          field: 'amount',
          issue: `total refunded '${totalRefunded}' would exceed the confirmed paid amount '${confirmedPaid}'`,
        },
      ]);
    }
  }

  private mapItemEntityToModel(
    entity: InferSelectModel<typeof mainEntities.saleItem>,
    catalogItemName: string,
  ): SaleItemModel {
    return {
      id: entity.id,
      catalogItemId: entity.catalogItemId,
      catalogItemName,
      quantity: entity.quantity,
      priceApplied: entity.priceApplied,
    };
  }

  private mapTransactionEntityToModel(
    entity: InferSelectModel<typeof mainEntities.saleTransaction>,
  ): SaleTransactionModel {
    return {
      id: entity.id,
      type: entity.type,
      paymentMethod: entity.paymentMethod,
      amount: entity.amount,
      installmentNumber: entity.installmentNumber ?? undefined,
      installmentCount: entity.installmentCount ?? undefined,
      dueDate: entity.dueDate ?? undefined,
      receivedAt: entity.receivedAt ?? undefined,
    };
  }

  private sumMoney(amounts: string[]): string {
    return amounts.reduce((sum, amount) => sum.plus(amount), Big(0)).toFixed(2);
  }

  private multiplyMoney(amount: string, quantity: number): string {
    return Big(amount).times(quantity).toFixed(2);
  }
}
