```
cs2-parser-stats
├─ cs-parser
│  ├─ anti-achievements-defs.js
│  ├─ archive-service.js
│  ├─ demo-analyzer.js
│  ├─ demoDatabase.ts
│  ├─ index.js
│  ├─ old-parser-functions.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ parser-functions.js
│  ├─ temp_demos
│  ├─ weapons.txt
│  └─ weapon_202512171141.csv
├─ docker-compose.yml
├─ LICENSE
├─ logs
│  └─ nginx
│     ├─ access.log
│     └─ error.log
├─ migrate.sh
├─ nextapp
│  ├─ .dockerignore
│  ├─ dockerfile
│  ├─ eslint.config.mjs
│  ├─ next.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ prisma
│  │  ├─ config.ts
│  │  ├─ data-1759640545669.csv
│  │  ├─ generated
│  │  │  ├─ browser.ts
│  │  │  ├─ client.ts
│  │  │  ├─ commonInputTypes.ts
│  │  │  ├─ enums.ts
│  │  │  ├─ internal
│  │  │  │  ├─ class.ts
│  │  │  │  ├─ prismaNamespace.ts
│  │  │  │  └─ prismaNamespaceBrowser.ts
│  │  │  ├─ models
│  │  │  │  ├─ Map.ts
│  │  │  │  ├─ Match.ts
│  │  │  │  ├─ MatchBlind.ts
│  │  │  │  ├─ MatchClutch.ts
│  │  │  │  ├─ MatchDamage.ts
│  │  │  │  ├─ MatchGrenade.ts
│  │  │  │  ├─ MatchInventory.ts
│  │  │  │  ├─ MatchKill.ts
│  │  │  │  ├─ MatchMap.ts
│  │  │  │  ├─ MatchMember.ts
│  │  │  │  ├─ MatchPlayerEconomy.ts
│  │  │  │  ├─ MatchTeam.ts
│  │  │  │  ├─ MatchTeamMapStat.ts
│  │  │  │  ├─ ProcessingSession.ts
│  │  │  │  ├─ Profile.ts
│  │  │  │  ├─ Round.ts
│  │  │  │  ├─ Tournament.ts
│  │  │  │  ├─ TournamentParticipant.ts
│  │  │  │  ├─ TournamentTeam.ts
│  │  │  │  ├─ User.ts
│  │  │  │  └─ Weapon.ts
│  │  │  └─ models.ts
│  │  ├─ migrations
│  │  │  ├─ 20251013042938_new_init
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251013044532_remove_mvp_round
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251014010605_id_autogenerate
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251014061820_no_attacker
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251016080141_tick_not_null
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251020081104_session
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251020090412_id_autoincrement_map
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251020090453_weapon_id_autoincrement
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251021063959_weapon_name_unique
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251030015501_draft_order_participant
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251031083918_win_team_num
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101042611_nickname
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101053949_deleted_unnecessary_relations
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101055056_round_undefined
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101055600_fix1
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101060022_unique_constraint
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101060159_back
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101060254_fix2
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101061043_tryfix3
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251101061918_kill_not_unique
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251210083700_added_weapon_cost_name
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251211053855_fix_inventory_uuid
│  │  │  │  └─ migration.sql
│  │  │  └─ migration_lock.toml
│  │  ├─ profile.txt
│  │  ├─ schema.prisma
│  │  ├─ ul_name_fastcup_ids.json
│  │  └─ weapons.js
│  ├─ prisma.config.ts
│  ├─ public
│  │  ├─ animation.gif
│  │  ├─ bg.jpg
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ next.svg
│  │  ├─ pick1.svg
│  │  ├─ pick2.svg
│  │  ├─ pick3.svg
│  │  ├─ pick4.svg
│  │  ├─ pick5.svg
│  │  ├─ player
│  │  │  ├─ dust2.png
│  │  │  └─ intersect.svg
│  │  ├─ ul2.png
│  │  ├─ Untitled
│  │  │  ├─ Group 31.svg
│  │  │  ├─ Group 32.svg
│  │  │  ├─ Group 33.svg
│  │  │  ├─ Group 34.svg
│  │  │  └─ Group 35.svg
│  │  ├─ vercel.svg
│  │  ├─ video.webm
│  │  └─ window.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ admin
│  │  │  │  └─ page.tsx
│  │  │  ├─ api
│  │  │  │  ├─ matches
│  │  │  │  │  ├─ progress
│  │  │  │  │  │  └─ [sessionId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ sessions
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ parse
│  │  │  │  │  └─ callback
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ stats
│  │  │  │  │  ├─ clutch
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ stats
│  │  │  │  │  │  ├─ query.ts
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ weapon
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ tournaments
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ users
│  │  │  │     ├─ batch
│  │  │  │     │  └─ route.ts
│  │  │  │     ├─ profile
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  ├─ favicon.ico
│  │  │  ├─ globals.css
│  │  │  ├─ layout.tsx
│  │  │  ├─ matches
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ _api
│  │  │  │     └─ api.ts
│  │  │  ├─ page.tsx
│  │  │  ├─ player
│  │  │  │  └─ [id]
│  │  │  │     ├─ layout.tsx
│  │  │  │     └─ page.tsx
│  │  │  ├─ testplayers
│  │  │  └─ upload
│  │  │     ├─ api.ts
│  │  │     ├─ page.tsx
│  │  │     └─ style.css
│  │  ├─ components
│  │  │  ├─ features
│  │  │  │  ├─ admin
│  │  │  │  │  ├─ tabs
│  │  │  │  │  │  ├─ MatchManagement.tsx
│  │  │  │  │  │  ├─ ParticipantList.tsx
│  │  │  │  │  │  ├─ ProfilesTab.tsx
│  │  │  │  │  │  └─ TournamentList.tsx
│  │  │  │  │  └─ UI
│  │  │  │  │     ├─ AddMatchForm.tsx
│  │  │  │  │     ├─ AddParticipantForm.tsx
│  │  │  │  │     ├─ AddProfileForm.tsx
│  │  │  │  │     ├─ AddTournamentForm.tsx
│  │  │  │  │     ├─ EmptyState.tsx
│  │  │  │  │     ├─ ErrorState.tsx
│  │  │  │  │     ├─ LoadingState.tsx
│  │  │  │  │     ├─ MatchCard.tsx
│  │  │  │  │     ├─ MatchFilters.tsx
│  │  │  │  │     ├─ ProgressBar.tsx
│  │  │  │  │     └─ SessionItem.tsx
│  │  │  │  ├─ home
│  │  │  │  │  ├─ CombatData.tsx
│  │  │  │  │  ├─ Draft.tsx
│  │  │  │  │  ├─ FibbonachiGrid.tsx
│  │  │  │  │  ├─ HeroSection.tsx
│  │  │  │  │  └─ MagicData.tsx
│  │  │  │  ├─ matches
│  │  │  │  │  └─ style.css
│  │  │  │  ├─ player
│  │  │  │  │  ├─ clutchSection
│  │  │  │  │  │  ├─ ClutchSkeleton.tsx
│  │  │  │  │  │  ├─ ClutchView.tsx
│  │  │  │  │  │  └─ index.tsx
│  │  │  │  │  ├─ GraphFigures.tsx
│  │  │  │  │  ├─ GraphSequence.tsx
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ playerCard
│  │  │  │  │  │  ├─ arror.svg
│  │  │  │  │  │  ├─ card-section.tsx
│  │  │  │  │  │  ├─ Intersect.png
│  │  │  │  │  │  └─ Intersect.svg
│  │  │  │  │  ├─ StatSection.tsx
│  │  │  │  │  ├─ statsSection
│  │  │  │  │  │  ├─ index.tsx
│  │  │  │  │  │  └─ StatsView.tsx
│  │  │  │  │  └─ weaponsSection
│  │  │  │  │     ├─ index.tsx
│  │  │  │  │     ├─ WeaponsGraph.tsx
│  │  │  │  │     └─ WeaponsSkeleton.tsx
│  │  │  │  └─ tournaments
│  │  │  │     ├─ MatchImporter.tsx
│  │  │  │     └─ TournamentSearch.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ HorizontalScrollRoot.tsx
│  │  │  │  └─ Navbar.tsx
│  │  │  ├─ SearchComponent.tsx
│  │  │  ├─ Select.tsx
│  │  │  └─ ui
│  │  │     ├─ PlayerCard.tsx
│  │  │     ├─ StatCard.tsx
│  │  │     └─ table.tsx
│  │  ├─ lib
│  │  │  ├─ api.ts
│  │  │  ├─ prisma.ts
│  │  │  └─ utils.ts
│  │  ├─ services
│  │  │  ├─ client
│  │  │  │  ├─ api.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ match.ts
│  │  │  │  ├─ participant.ts
│  │  │  │  ├─ tournament.ts
│  │  │  │  └─ user.ts
│  │  │  └─ server
│  │  │     ├─ server-parse-services
│  │  │     │  ├─ cleanup-service.ts
│  │  │     │  ├─ database-service.ts
│  │  │     │  ├─ demo-parser-service.ts
│  │  │     │  ├─ download-service.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ add-participants.dto.ts
│  │  │     │  │  ├─ create-tournament-team.dto.ts
│  │  │     │  │  ├─ create-tournament.dto.ts
│  │  │     │  │  ├─ participant-response.dto.ts
│  │  │     │  │  └─ update-tournament.dto.ts
│  │  │     │  ├─ matchesService.ts
│  │  │     │  ├─ prisma-session-store.ts
│  │  │     │  ├─ query.ts
│  │  │     │  └─ tournaments.service.ts
│  │  │     └─ validation
│  │  │        └─ match-validation.ts
│  │  ├─ store
│  │  │  ├─ index.ts
│  │  │  └─ slices
│  │  │     ├─ index.ts
│  │  │     ├─ matchSlice.ts
│  │  │     ├─ participantSlice.ts
│  │  │     ├─ progressSlice.ts
│  │  │     ├─ tournamentSlice.ts
│  │  │     ├─ uiSlice.ts
│  │  │     └─ usersSlice.ts
│  │  └─ types
│  │     ├─ demo-processing.ts
│  │     ├─ index.ts
│  │     ├─ match.ts
│  │     ├─ store.ts
│  │     ├─ tournament.ts
│  │     └─ types.ts
│  ├─ tsconfig.json
│  ├─ vercel.json
│  └─ workflows
│     └─ deploy.yml
├─ nginx.conf
├─ package-lock.json
├─ postgres
│  └─ backups
└─ update.sh

```
