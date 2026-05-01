-- supabase/migrations/20260501_booking_tokens.sql

create table booking_tokens (
  id            uuid        primary key default gen_random_uuid(),
  token         text        not null unique,
  token_type    text        not null check (token_type in ('cancel', 'my_bookings')),
  booking_id    uuid        references bookings(id) on delete cascade,
  consumer_email            text,
  stripe_payment_intent_id  text,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index booking_tokens_token_idx      on booking_tokens(token);
create index booking_tokens_booking_id_idx on booking_tokens(booking_id);
