
ALTER TABLE users
  ALTER COLUMN wasal_code TYPE VARCHAR(15);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_wasal_code_format;

ALTER TABLE users
  ADD CONSTRAINT users_wasal_code_format
  CHECK (wasal_code ~ '^[A-Za-z0-9]{15}$');
