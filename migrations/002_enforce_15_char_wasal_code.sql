-- Ensure Wasal codes use exactly 15 English letters or digits.
-- Keep existing valid codes unchanged.
-- Replace only codes that do not match the required format.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE users
  ALTER COLUMN wasal_code TYPE VARCHAR(15);

UPDATE users
SET wasal_code = LEFT(
  REPLACE(gen_random_uuid()::TEXT, '-', ''),
  15
)
WHERE wasal_code !~ '^[A-Za-z0-9]{15}$';

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_wasal_code_format;

ALTER TABLE users
  ADD CONSTRAINT users_wasal_code_format
  CHECK (wasal_code ~ '^[A-Za-z0-9]{15}$');
