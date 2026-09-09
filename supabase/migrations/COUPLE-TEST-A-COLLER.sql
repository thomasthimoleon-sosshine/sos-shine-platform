-- ═══════════════════════════════════════════════════════════════════════════
-- SOS MEET COUPLE — CRÉER UN COUPLE DE TEST RÉEL
-- ═══════════════════════════════════════════════════════════════════════════
-- AUCUNE MIGRATION N'EST NÉCESSAIRE : la base est déjà complète et conforme
-- au code. Ce script ne crée pas de table, il fabrique un couple de test avec
-- de vraies réponses, pour que la carte s'affiche tout de suite.
--
-- AVANT DE LANCER :
--   1. Créez deux comptes sur le site, par exemple depuis /sos-meet/couple/duo,
--      ou utilisez deux comptes existants.
--   2. Remplacez les deux e-mails ci-dessous par les leurs.
--   3. Lancez le script dans l'éditeur SQL Supabase.
--   4. Connectez-vous avec l'un des deux et ouvrez /sos-meet/couple/carte
--
-- Le scénario : la personne A va bien. La personne B souffre sur trois points,
-- et A ne s'en doute pas. C'est exactement ce que le moteur est fait pour voir.
--
-- Réexécutable : le couple de test est recréé proprement à chaque lancement.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  email_a text := 'REMPLACEZ-MOI-A@exemple.com';   -- <<< la personne qui va bien
  email_b text := 'REMPLACEZ-MOI-B@exemple.com';   -- <<< celle qui souffre en silence
  uid_a uuid;
  uid_b uuid;
  cid uuid;
begin
  select id into uid_a from auth.users where lower(email) = lower(email_a);
  select id into uid_b from auth.users where lower(email) = lower(email_b);

  if uid_a is null then raise exception 'Compte introuvable : %. Créez-le sur le site d''abord.', email_a; end if;
  if uid_b is null then raise exception 'Compte introuvable : %. Créez-le sur le site d''abord.', email_b; end if;
  if uid_a = uid_b then raise exception 'Il faut deux comptes différents.'; end if;

  -- On repart propre : on archive tout duo en cours pour ces deux personnes.
  delete from public.sosmeet_couples
   where partner_a in (uid_a, uid_b) or partner_b in (uid_a, uid_b);

  insert into public.sosmeet_couples (invite_code, invite_expires, partner_a, partner_b, status)
  values ('TEST' || upper(substr(md5(random()::text), 1, 4)), now() + interval '7 days',
          uid_a, uid_b, 'QUESTIONNAIRES_COMPLETS')
  returning id into cid;

  -- Les deux questionnaires, scellés.
  insert into public.sosmeet_couple_answers (couple_id, user_id, answers, open_answers, timings, sealed_at)
  values
    (cid, uid_a, '{"c_resp_self":3,"c_resp_other":3,"c_resp2_self":3,"c_intim_self":3,"c_intim_other":3,"c_secu_self":3,"c_secu_other":3,"c_comm_self":3,"c_comm_other":3,"c_comm2_self":3,"c_comm3_self":1,"c_conf_self":1,"c_conf_other":1,"c_conf2_self":1,"c_conf3_self":1,"c_rep_self":3,"c_rep_other":3,"c_rep2_self":3,"c_rep3_self":1,"c_adm_self":4,"c_adm_other":4,"c_adm2_self":0,"c_resp_r_self":4,"c_resp_r_other":4,"c_des_self":3,"c_des_other":3,"c_des2_self":3,"c_des3_self":3,"c_des4_self":3,"c_equi_self":3,"c_equi_other":3,"c_equi2_self":1,"c_auto_self":3,"c_auto_other":3,"c_proj_self":3,"c_proj_other":3,"c_val_self":3,"c_val_other":3,"c_ranc_self":1,"c_ranc_other":1,"c_ranc2_self":1,"v_peur":0,"v_isolement":0,"v_argent":0,"v_humiliation":0,"v_surveillance":0,"v_contrainte":0}'::jsonb, '{}'::jsonb, '{}'::jsonb, now()),
    (cid, uid_b, '{"c_resp_self":1,"c_resp_other":1,"c_resp2_self":1,"c_intim_self":1,"c_intim_other":1,"c_secu_self":3,"c_secu_other":3,"c_comm_self":3,"c_comm_other":3,"c_comm2_self":3,"c_comm3_self":1,"c_conf_self":1,"c_conf_other":1,"c_conf2_self":1,"c_conf3_self":1,"c_rep_self":3,"c_rep_other":3,"c_rep2_self":3,"c_rep3_self":1,"c_adm_self":4,"c_adm_other":4,"c_adm2_self":0,"c_resp_r_self":4,"c_resp_r_other":4,"c_des_self":1,"c_des_other":1,"c_des2_self":1,"c_des3_self":1,"c_des4_self":1,"c_equi_self":2,"c_equi_other":2,"c_equi2_self":2,"c_auto_self":3,"c_auto_other":3,"c_proj_self":3,"c_proj_other":3,"c_val_self":3,"c_val_other":3,"c_ranc_self":1,"c_ranc_other":1,"c_ranc2_self":1,"v_peur":0,"v_isolement":0,"v_argent":0,"v_humiliation":0,"v_surveillance":0,"v_contrainte":0}'::jsonb, '{}'::jsonb, '{}'::jsonb, now());

  -- Dates de naissance, pour que la lecture énergétique apparaisse.
  insert into public.sosmeet_couple_birth
    (couple_id, user_id, birth_date, birth_time, birth_place, birth_lat, birth_lon, time_accuracy, consent)
  values
    (cid, uid_a, '1990-05-15', '10:30', 'Toulouse', 43.6047, 1.4442, 'exacte', true),
    (cid, uid_b, '1985-11-02', '21:15', 'Paris',    48.8566, 2.3522, 'exacte', true);

  raise notice 'Couple de test créé. Connectez-vous et ouvrez /sos-meet/couple/carte';
end $$;

-- Vérification : doit renvoyer une ligne, deux questionnaires scellés,
-- deux dates de naissance.
select c.status,
       (select count(*) from public.sosmeet_couple_answers a
         where a.couple_id = c.id and a.sealed_at is not null) as questionnaires_scelles,
       (select count(*) from public.sosmeet_couple_birth b where b.couple_id = c.id) as dates_naissance
from public.sosmeet_couples c
where c.invite_code like 'TEST%'
order by c.created_at desc limit 1;
