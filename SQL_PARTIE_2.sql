INSERT INTO public.profiles (id, prenom, email, role, avatar_url)
SELECT
  auth_users.id,
  COALESCE(auth_users.raw_user_meta_data->>'prenom', split_part(COALESCE(auth_users.raw_user_meta_data->>'full_name', auth_users.raw_user_meta_data->>'name', 'Membre'), ' ', 1)),
  COALESCE(auth_users.email, ''),
  'member',
  COALESCE(auth_users.raw_user_meta_data->>'avatar_url', auth_users.raw_user_meta_data->>'picture')
FROM auth.users AS auth_users
LEFT JOIN public.profiles ON public.profiles.id = auth_users.id
WHERE public.profiles.id IS NULL;
