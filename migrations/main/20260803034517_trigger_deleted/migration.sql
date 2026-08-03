CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "anamnesis_field" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "anamnesis_field_validation" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "appointment" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "appointment_item" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "catalog_item" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "config" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "customer" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "customer_anamnesis" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "customer_anamnesis_field" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "customer_followup" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "employee" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "followup_item" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "person" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "person_phone" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();
