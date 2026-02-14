
-- Add btc_address column to services table so admins can configure per-service BTC payment address
ALTER TABLE public.services ADD COLUMN btc_address text;
