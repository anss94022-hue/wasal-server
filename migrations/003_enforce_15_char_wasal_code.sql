BEGIN;

-- Ensure the column supports exactly 15 characters.
ALTER TABLE users
  ALTER COLUMN wasal_code TYPE VARCHAR(15);

-- Update old test codes before enforcing the new rule.
UPDATE users
SET wasal_code = LEFT(
  REPLACE(gen_random_uuid()::TEXT, '-', ''),
  15
)
WHERE wasal_code !~ '^[A-Za-z0-9]{15}$';

-- Require exactly 15 English letters or digits.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_wasal_code_format;

ALTER TABLE users
  ADD CONSTRAINT users_wasal_code_format
  CHECK (wasal_code ~ '^[A-Za-z0-9]{15}$');

COMMIT;
