/*
  Warnings:

  - A unique constraint covering the columns `[inflictor_id,victim_id,round_id,hitbox_group,weapon_id]` on the table `match_damage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[killer_id,victim_id,round_id]` on the table `match_kill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "match_damage_inflictor_id_victim_id_round_id_hitbox_group_w_key" ON "match_damage"("inflictor_id", "victim_id", "round_id", "hitbox_group", "weapon_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_kill_killer_id_victim_id_round_id_key" ON "match_kill"("killer_id", "victim_id", "round_id");
