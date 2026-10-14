-- Migration 004: تطبيق قاعدة رمز وصال النهائية.
-- القاعدة: 15 خانة بالضبط، حروف إنجليزية وأرقام فقط،
-- مع حرف إنجليزي واحد على الأقل ورقم واحد على الأقل.

-- 1) معالجة الرموز غير المطابقة أو المكررة تلقائيًا بدل إسقاط الترحيل كله.
DO $$
DECLARE
  rec RECORD;
  candidate TEXT;
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  attempts INT;
  i INT;
BEGIN
  FOR rec IN
    SELECT u.id
    FROM users u
    WHERE u.wasal_code IS NULL
       OR u.wasal_code !~ '^[A-Za-z0-9]{15}$'
       OR u.wasal_code !~ '[A-Za-z]'
       OR u.wasal_code !~ '[0-9]'
       OR EXISTS (
            SELECT 1
            FROM users d
            WHERE d.wasal_code = u.wasal_code
              AND d.id <> u.id
          )
  LOOP
    attempts := 0;

    LOOP
      attempts := attempts + 1;

      candidate := '';
      FOR i IN 1..13 LOOP
        candidate := candidate || substr(
          alphabet,
          1 + floor(random() * length(alphabet))::int,
          1
        );
      END LOOP;

      -- إضافة حرف ورقم مضمونين لإرضاء قاعدة التحقق.
      candidate := candidate || 'A' || '7';

      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM users WHERE wasal_code = candidate
      );

      IF attempts > 50 THEN
        RAISE EXCEPTION 'المعالجة توقفت: تعذر توليد رمز فريد بعد 50 محاولة.';
      END IF;
    END LOOP;

    UPDATE users
    SET wasal_code = candidate,
        updated_at = NOW()
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 2) فرض القيد النهائي.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_wasal_code_format;

ALTER TABLE users
  ADD CONSTRAINT users_wasal_code_format
  CHECK (
    wasal_code ~ '^[A-Za-z0-9]{15}$'
    AND wasal_code ~ '[A-Za-z]'
    AND wasal_code ~ '[0-9]'
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wasal_code_unique
  ON users (wasal_code);
