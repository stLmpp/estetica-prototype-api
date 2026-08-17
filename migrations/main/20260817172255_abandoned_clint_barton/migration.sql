-- Custom SQL migration file, put your code below! --
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "anamnesis_form" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "anamnesis_section" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();
