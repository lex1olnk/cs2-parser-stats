-- Steam-авторизация + отказ от персональных данных.
--
-- 1. Убираем email из profile: единственное PII-поле в схеме. Идентичность
--    пользователя теперь целиком определяется Steam-аккаунтом (user.steam_id),
--    поэтому хранить контактные данные незачем.
-- 2. Добавляем в user признак администратора и отметку последнего входа.
--    Права живут на Steam-аккаунте, а не на profile: логинится именно user.

ALTER TABLE "profile" DROP COLUMN IF EXISTS "email";

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
