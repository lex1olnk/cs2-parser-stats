-- CreateTable
CREATE TABLE "match_inventory" (
    "id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weapon_id" INTEGER NOT NULL,
    "round_id" UUID NOT NULL,
    "economy_snapshot_id" UUID NOT NULL,

    CONSTRAINT "match_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_blind" (
    "id" UUID NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "tick" DOUBLE PRECISION,
    "attacker_id" INTEGER,
    "victim_id" INTEGER,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,

    CONSTRAINT "match_blind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_player_economy" (
    "id" UUID NOT NULL,
    "start_money" INTEGER NOT NULL,
    "team_num" INTEGER NOT NULL,
    "tick" DOUBLE PRECISION,
    "user_id" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,

    CONSTRAINT "match_player_economy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_player_economy_user_id_round_id_key" ON "match_player_economy"("user_id", "round_id");

-- AddForeignKey
ALTER TABLE "match_inventory" ADD CONSTRAINT "match_inventory_economy_snapshot_id_fkey" FOREIGN KEY ("economy_snapshot_id") REFERENCES "match_player_economy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_inventory" ADD CONSTRAINT "match_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_inventory" ADD CONSTRAINT "match_inventory_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapon"("weapon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_inventory" ADD CONSTRAINT "match_inventory_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_blind" ADD CONSTRAINT "match_blind_attacker_id_fkey" FOREIGN KEY ("attacker_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_blind" ADD CONSTRAINT "match_blind_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_blind" ADD CONSTRAINT "match_blind_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_blind" ADD CONSTRAINT "match_blind_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_player_economy" ADD CONSTRAINT "match_player_economy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_player_economy" ADD CONSTRAINT "match_player_economy_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_player_economy" ADD CONSTRAINT "match_player_economy_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
