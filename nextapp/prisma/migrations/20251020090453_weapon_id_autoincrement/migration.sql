-- AlterTable
CREATE SEQUENCE weapon_weapon_id_seq;
ALTER TABLE "weapon" ALTER COLUMN "weapon_id" SET DEFAULT nextval('weapon_weapon_id_seq');
ALTER SEQUENCE weapon_weapon_id_seq OWNED BY "weapon"."weapon_id";
