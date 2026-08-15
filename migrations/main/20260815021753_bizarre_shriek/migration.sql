-- Custom SQL migration file, put your code below! --
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "employee_service" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "sale" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "sale_item" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "sale_transaction" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();
