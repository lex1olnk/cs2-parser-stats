-- AlterTable
CREATE SEQUENCE map_id_seq;
ALTER TABLE "map" ALTER COLUMN "id" SET DEFAULT nextval('map_id_seq');
ALTER SEQUENCE map_id_seq OWNED BY "map"."id";
