# TODO

Create db user

```sql
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1
                       FROM pg_roles
                       WHERE rolname = 'app_user') THEN
            CREATE USER app_user WITH PASSWORD 'your_secure_password';
        END IF;
    END
$$;;
GRANT CONNECT ON DATABASE postgres TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO app_user;
```

