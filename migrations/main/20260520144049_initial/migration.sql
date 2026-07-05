CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE ROLE authenticated NOLOGIN;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

GRANT authenticated TO app_user;

CREATE OR REPLACE FUNCTION prefixed_uuid(prefix text)
RETURNS VARCHAR(38) AS $$
  SELECT prefix || '_' || replace(uuidv7()::text, '-', '');
$$ LANGUAGE sql VOLATILE;