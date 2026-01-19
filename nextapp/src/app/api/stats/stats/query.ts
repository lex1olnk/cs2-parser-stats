export const detailedQuery = `
select 1            as id
     , 1            as card
     , 'Damage' as title
     , sum(damage)  as value
     , 1            as ord
     , 1            as visible
  from damage_stats_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
 union
select 2
     , 1
     , 'Rounds'
     , sum(rounds)
     , 2
     , 1
  from rounds_played_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
 union 
select 3
     , 2
     , 'Kills'
     , sum(kills)
     , 1
     , 1
  from kill_stats_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
 union 
select 4
     , 2
     , 'Deaths'
     , sum(deaths)
     , 2
     , 1
  from death_stats_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
 union 
select 5
     , 2
     , 'Assists'
     , sum(assists)
     , 3
     , 1
  from assist_stats_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
 union 
select 6
     , 3
     , 'Headshots'
     , sum(hs_kills)
     , 1
     , 1
  from kill_stats_per_match
 where player_id = 643
   and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
 group by player_id
  union 
 select 7
      , 4
      , 'KAST'
      , round(sum(kast_rounds) / sum(total_rounds) * 100, 2)
      , 1
      , 1
   from kast_per_match
  where player_id = 643
    and tournament_id = 'a1db54db-0f60-46cd-bc88-ecb18759bc9e'
  group by player_id`;
