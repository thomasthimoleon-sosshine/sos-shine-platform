-- SOS Meet — le profil s'appuie sur le compte (user_id), plus sur la waitlist.
-- À appliquer une fois. L'API reste robuste même avant application (elle garantit
-- une ligne waitlist pour satisfaire l'ancienne contrainte).
alter table public.sosmeet_profiles drop constraint if exists sosmeet_profiles_email_fkey;
alter table public.sosmeet_profiles alter column email drop not null;
create unique index if not exists uq_sosmeet_profiles_user on public.sosmeet_profiles (user_id) where user_id is not null;
