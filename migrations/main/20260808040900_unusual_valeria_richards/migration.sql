DROP POLICY "deleted_write_policy" ON "config";--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "config";--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "config";--> statement-breakpoint
ALTER TABLE "config" DISABLE ROW LEVEL SECURITY;