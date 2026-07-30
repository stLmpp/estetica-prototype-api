import { pgEnum, pgTable, text, boolean, timestamp, integer, index, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const anamnesisFieldType = pgEnum("anamnesis_field_type", ["TEXT", "NUMBER", "DATE", "CHECKBOX", "RADIO", "SELECT"])
export const anamnesisFieldValidationType = pgEnum("anamnesis_field_validation_type", ["required", "minLength", "maxLength", "minValue", "maxValue", "pattern"])
export const appointmentStatus = pgEnum("appointment_status", ["Agendado", "Concluído", "Cancelado", "Não compareceu"])
export const catalogItemType = pgEnum("catalog_item_type", ["Produto", "Serviço"])
export const configType = pgEnum("config_type", ["STRING", "NUMBER", "BOOLEAN", "JSON"])
export const maritalStatus = pgEnum("marital_status", ["Casado(a)", "Solteiro(a)", "Divorciado(a)", "Viúvo(a)"])
export const phoneType = pgEnum("phone_type", ["Celular", "Residencial", "Trabalho"])


export const authAccount = pgTable("auth_account", {
	id: text().primaryKey(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull().references(() => authUser.id, { onDelete: "cascade" } ),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true }).notNull(),
}, (table) => [
	index("auth_account_userId_idx").using("btree", table.userId.asc().nullsLast()),
]);

export const authInvitation = pgTable("auth_invitation", {
	id: text().primaryKey(),
	organizationId: text().notNull().references(() => authOrganization.id, { onDelete: "cascade" } ),
	email: text().notNull(),
	role: text(),
	status: text().notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	inviterId: text().notNull().references(() => authUser.id, { onDelete: "cascade" } ),
}, (table) => [
	index("auth_invitation_email_idx").using("btree", table.email.asc().nullsLast()),
	index("auth_invitation_organizationId_idx").using("btree", table.organizationId.asc().nullsLast()),
]);

export const authMember = pgTable("auth_member", {
	id: text().primaryKey(),
	organizationId: text().notNull().references(() => authOrganization.id, { onDelete: "cascade" } ),
	userId: text().notNull().references(() => authUser.id, { onDelete: "cascade" } ),
	role: text().notNull(),
	createdAt: timestamp({ withTimezone: true }).notNull(),
}, (table) => [
	index("auth_member_organizationId_idx").using("btree", table.organizationId.asc().nullsLast()),
	index("auth_member_userId_idx").using("btree", table.userId.asc().nullsLast()),
]);

export const authOrganization = pgTable("auth_organization", {
	id: text().primaryKey(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ withTimezone: true }).notNull(),
	metadata: text(),
	membershipLimit: integer("membership_limit").notNull(),
}, (table) => [
	unique("auth_organization_slug_key").on(table.slug),]);

export const authUser = pgTable("auth_user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	role: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp({ withTimezone: true }),
}, (table) => [
	unique("auth_user_email_key").on(table.email),]);
