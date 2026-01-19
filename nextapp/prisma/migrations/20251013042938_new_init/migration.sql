-- CreateTable
CREATE TABLE "tournament" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mvp_user_id" INTEGER,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "seed" INTEGER,
    "tournament_id" UUID NOT NULL,
    "captain_id" INTEGER NOT NULL,

    CONSTRAINT "tournament_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_participant" (
    "id" UUID NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "tournament_id" UUID NOT NULL,
    "tournament_team_id" UUID,

    CONSTRAINT "tournament_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "demoPath" TEXT NOT NULL,
    "best_of" INTEGER NOT NULL,
    "has_winner" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,
    "max_rounds_count" INTEGER NOT NULL,
    "server_instance_id" TEXT NOT NULL,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "tournament_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_map" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "map_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,
    "game_status" TEXT NOT NULL,
    "match_id" UUID NOT NULL,

    CONSTRAINT "match_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "topview" TEXT NOT NULL,

    CONSTRAINT "map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "team_num" INTEGER,
    "is_winner" BOOLEAN NOT NULL,
    "captain_id" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,

    CONSTRAINT "match_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_team_map_stat" (
    "score" INTEGER NOT NULL,
    "is_winner" BOOLEAN NOT NULL,
    "initial_side" TEXT NOT NULL,
    "match_map_id" UUID NOT NULL,
    "match_team_id" UUID NOT NULL,

    CONSTRAINT "match_team_map_stat_pkey" PRIMARY KEY ("match_map_id","match_team_id")
);

-- CreateTable
CREATE TABLE "match_member" (
    "hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL,
    "impact" DOUBLE PRECISION,
    "connected" BOOLEAN NOT NULL,
    "is_leaver" BOOLEAN NOT NULL,
    "match_id" UUID,
    "match_team_id" UUID,
    "user_id" INTEGER,

    CONSTRAINT "match_member_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "nick_name" TEXT NOT NULL,
    "avatar" TEXT,
    "profile_id" INTEGER,
    "steam_id" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round" (
    "id" UUID NOT NULL,
    "win_reason" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,
    "win_match_team_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "match_map_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL,
    "end_reason" INTEGER,
    "tick" DOUBLE PRECISION,
    "mvp_player_id" INTEGER NOT NULL,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_kill" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "killer_id" INTEGER NOT NULL,
    "victim_id" INTEGER,
    "assistant_id" INTEGER,
    "weapon_id" INTEGER,
    "is_wallbang" BOOLEAN NOT NULL,
    "is_headshot" BOOLEAN NOT NULL,
    "is_teamkill" BOOLEAN NOT NULL,
    "is_airshot" BOOLEAN NOT NULL,
    "is_noscope" BOOLEAN NOT NULL,
    "is_through_smoke" BOOLEAN NOT NULL,
    "is_scoreboard_kill" BOOLEAN NOT NULL DEFAULT true,
    "distance" DOUBLE PRECISION NOT NULL,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "round_time" INTEGER NOT NULL,
    "killer_position_x" DOUBLE PRECISION NOT NULL,
    "killer_position_y" DOUBLE PRECISION NOT NULL,
    "victim_position_x" DOUBLE PRECISION NOT NULL,
    "victim_position_y" DOUBLE PRECISION NOT NULL,
    "tick" DOUBLE PRECISION,

    CONSTRAINT "match_kill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_damage" (
    "id" UUID NOT NULL,
    "inflictor_id" INTEGER NOT NULL,
    "victim_id" INTEGER NOT NULL,
    "weapon_id" INTEGER NOT NULL,
    "hitbox_group" TEXT NOT NULL,
    "damage_real" INTEGER NOT NULL,
    "damage_normalized" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "tick" DOUBLE PRECISION,

    CONSTRAINT "match_damage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_clutch" (
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,

    CONSTRAINT "match_clutch_pkey" PRIMARY KEY ("user_id","match_id","round_id")
);

-- CreateTable
CREATE TABLE "match_grenade" (
    "id" UUID NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "grenade_type" INTEGER NOT NULL,
    "throw_position_x" DOUBLE PRECISION,
    "throw_position_y" DOUBLE PRECISION,
    "throw_position_z" DOUBLE PRECISION,
    "detonate_position_x" DOUBLE PRECISION,
    "detonate_position_y" DOUBLE PRECISION,
    "detonate_position_z" DOUBLE PRECISION,
    "round_time" INTEGER NOT NULL,
    "tick" DOUBLE PRECISION,

    CONSTRAINT "match_grenade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon" (
    "weapon_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "internal_name" TEXT NOT NULL,

    CONSTRAINT "weapon_pkey" PRIMARY KEY ("weapon_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participant_profile_id_tournament_id_key" ON "tournament_participant"("profile_id", "tournament_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_demoPath_key" ON "match"("demoPath");

-- CreateIndex
CREATE UNIQUE INDEX "user_steam_id_key" ON "user"("steam_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_name_key" ON "profile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_mvp_user_id_fkey" FOREIGN KEY ("mvp_user_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_tournament_team_id_fkey" FOREIGN KEY ("tournament_team_id") REFERENCES "tournament_team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_map" ADD CONSTRAINT "match_map_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_map" ADD CONSTRAINT "match_map_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_team" ADD CONSTRAINT "match_team_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_team_map_stat" ADD CONSTRAINT "match_team_map_stat_match_map_id_fkey" FOREIGN KEY ("match_map_id") REFERENCES "match_map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_team_map_stat" ADD CONSTRAINT "match_team_map_stat_match_team_id_fkey" FOREIGN KEY ("match_team_id") REFERENCES "match_team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_member" ADD CONSTRAINT "match_member_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_member" ADD CONSTRAINT "match_member_match_team_id_fkey" FOREIGN KEY ("match_team_id") REFERENCES "match_team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_member" ADD CONSTRAINT "match_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_match_map_id_fkey" FOREIGN KEY ("match_map_id") REFERENCES "match_map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapon"("weapon_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_killer_id_fkey" FOREIGN KEY ("killer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapon"("weapon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_inflictor_id_fkey" FOREIGN KEY ("inflictor_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_clutch" ADD CONSTRAINT "match_clutch_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_clutch" ADD CONSTRAINT "match_clutch_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_clutch" ADD CONSTRAINT "match_clutch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_grenade" ADD CONSTRAINT "match_grenade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_grenade" ADD CONSTRAINT "match_grenade_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_grenade" ADD CONSTRAINT "match_grenade_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
