-- Demo data. Every person here is made up.
-- Sign in as ada@lemonstand.test, bram@lemonstand.test or owner@lemonstand.test,
-- password lemonade123.

insert into public.services (id, name, description, minutes, price_cents) values
  ('5e0b8c1e-0001-4000-8000-000000000001', 'Juice workshop', 'Press, taste and take home three bottles.', 90, 4500),
  ('5e0b8c1e-0001-4000-8000-000000000002', 'Private tasting', 'Six seasonal juices for up to four people.', 60, 6000),
  ('5e0b8c1e-0001-4000-8000-000000000003', 'Kids lemonade class', 'Squeeze, stir and decorate. Ages 6 to 10.', 45, 2500);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-4000-8000-00000000000a', 'authenticated', 'authenticated',
   'ada@lemonstand.test', crypt('lemonade123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ada Visser"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'b0b0b0b0-0000-4000-8000-00000000000b', 'authenticated', 'authenticated',
   'bram@lemonstand.test', crypt('lemonade123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Bram de Wit"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'c0c0c0c0-0000-4000-8000-00000000000c', 'authenticated', 'authenticated',
   'owner@lemonstand.test', crypt('lemonade123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Lotte Citroen","role":"admin"}', now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text,
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users;

update public.profiles set phone = '+31 6 1234 5601' where id = 'a0a0a0a0-0000-4000-8000-00000000000a';
update public.profiles set phone = '+31 6 1234 5602' where id = 'b0b0b0b0-0000-4000-8000-00000000000b';
update public.profiles set phone = '+31 6 1234 5600' where id = 'c0c0c0c0-0000-4000-8000-00000000000c';

-- A dozen bookings over the coming days, including walk-ins without an account.
insert into public.bookings (user_id, service_id, starts_at, customer_name, customer_email, customer_phone, note, status, amount_cents)
select b.user_id, b.service_id,
       (date_trunc('day', now() at time zone 'Europe/Amsterdam') + b.day_offset * interval '1 day' + b.hour * interval '1 hour') at time zone 'Europe/Amsterdam',
       b.customer_name, b.customer_email, b.customer_phone, b.note, b.status, b.amount_cents
from (values
  ('a0a0a0a0-0000-4000-8000-00000000000a'::uuid, '5e0b8c1e-0001-4000-8000-000000000001'::uuid, 1, 10, 'Ada Visser', 'ada@lemonstand.test', '+31 6 1234 5601', 'Birthday present for my sister.', 'paid', 4500),
  ('a0a0a0a0-0000-4000-8000-00000000000a', '5e0b8c1e-0001-4000-8000-000000000002', 4, 14, 'Ada Visser', 'ada@lemonstand.test', '+31 6 1234 5601', '', 'pending', 6000),
  ('b0b0b0b0-0000-4000-8000-00000000000b', '5e0b8c1e-0001-4000-8000-000000000003', 2, 12, 'Bram de Wit', 'bram@lemonstand.test', '+31 6 1234 5602', 'Two kids, one is allergic to strawberries.', 'paid', 2500),
  (null, '5e0b8c1e-0001-4000-8000-000000000001', 1, 14, 'Fatima El Amrani', 'fatima.elamrani@example.com', '+31 6 2233 4455', '', 'paid', 4500),
  (null, '5e0b8c1e-0001-4000-8000-000000000002', 2, 16, 'Joost Bakker', 'joost.bakker@example.com', '+31 6 9876 5432', 'Company outing, invoice to Bakker BV please.', 'pending', 6000),
  (null, '5e0b8c1e-0001-4000-8000-000000000003', 3, 10, 'Mila Jansen', 'mila.j@example.com', '+31 6 1111 2222', '', 'paid', 2500),
  (null, '5e0b8c1e-0001-4000-8000-000000000001', 3, 14, 'Sven Peters', 'sven@example.com', '+31 6 3333 4444', 'Wheelchair access needed.', 'paid', 4500),
  (null, '5e0b8c1e-0001-4000-8000-000000000002', 5, 12, 'Noor Hendriks', 'noor.hendriks@example.com', '+31 6 5555 6666', '', 'pending', 6000),
  (null, '5e0b8c1e-0001-4000-8000-000000000001', 6, 10, 'Daan Smit', 'daan.smit@example.com', '+31 6 7777 8888', '', 'paid', 4500),
  (null, '5e0b8c1e-0001-4000-8000-000000000003', 6, 14, 'Eva de Boer', 'eva.deboer@example.com', '+31 6 9999 0000', 'My son is 5, is that okay?', 'pending', 2500),
  (null, '5e0b8c1e-0001-4000-8000-000000000002', -1, 16, 'Lucas Mulder', 'lucas.mulder@example.com', '+31 6 1212 3434', '', 'done', 6000),
  (null, '5e0b8c1e-0001-4000-8000-000000000001', -2, 10, 'Sara Vos', 'sara.vos@example.com', '+31 6 5656 7878', '', 'done', 4500)
) as b(user_id, service_id, day_offset, hour, customer_name, customer_email, customer_phone, note, status, amount_cents);
