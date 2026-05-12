-- Add ARS-equivalent amount and exchange rate snapshot to transactions
-- For USD transactions, amount_ars stores the ARS equivalent at time of creation
-- For ARS transactions, amount_ars is NULL (use amount directly)

alter table public.transactions
  add column amount_ars bigint,
  add column exchange_rate numeric(12,4);
