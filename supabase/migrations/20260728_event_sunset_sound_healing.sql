-- Nouvel événement : Sunset Sound Healing (Mougins, 4 août 2026)
-- À coller dans Supabase (SQL Editor). Ensuite modifiable dans /admin/physical-events.
-- La photo (image_url) reste vide : à ajouter depuis l'admin.

INSERT INTO public.physical_events (
  title, subtitle, description, event_date, end_time,
  location_name, address, is_free, price_label,
  stripe_url, cta_label, max_spots, is_published, sort_order
) VALUES (
  'Sunset Sound Healing',
  'Bols tibétains au coucher du soleil · Mougins',
  'On ne t''apprend jamais à te déposer.

On t''apprend à performer, à tenir, à gérer. Rarement à relâcher pour de vrai — sans écran, sans objectif, sans rien à réussir.

Mardi 4 août, au bord de l''Étang de Fontmerle à Mougins, on te propose exactement ça : un Sunset Sound Healing où la seule chose à faire est d''arrêter de faire.

Les bols tibétains ne « détendent » pas au sens où on l''entend d''habitude. Leurs vibrations parlent à un système nerveux qui, lui, sait comment lâcher — quand on lui en laisse enfin l''espace.

Autour : les lotus, les oiseaux, la lumière qui baisse. Rien à faire d''autre qu''être là.

Un vrai temps de déconditionnement — le genre dont on ressort différent, pas juste reposé.',
  '2026-08-04 19:00:00+02',
  '20h20',
  'Étang de Fontmerle, Mougins',
  'Parc de la Valmasque, Mougins',
  false,
  '25 €',
  'https://book.stripe.com/9B66oz3TCdRx2sN0C65ZC0s',
  'Réserver ma place',
  20,
  true,
  1
);
