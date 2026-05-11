-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_url text,
  locale text not null default 'es' check (locale in ('es', 'en')),
  currency_preference text not null default 'ARS' check (currency_preference in ('ARS', 'USD')),
  created_at timestamptz not null default now()
);

-- Groups
create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'family' check (type in ('personal', 'family', 'business')),
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

-- Group members
create table public.group_members (
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

-- Categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  type text not null check (type in ('income', 'expense')),
  is_shared boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Transactions
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id),
  category_id uuid not null references public.categories(id),
  amount integer not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  type text not null check (type in ('income', 'expense', 'transfer')),
  description text not null default '',
  date date not null default current_date,
  receipt_url text,
  is_shared boolean not null default true,
  ai_extracted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Budgets
create table public.budgets (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  amount integer not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  period text not null default 'monthly' check (period in ('monthly', 'weekly')),
  month text not null,
  created_at timestamptz not null default now(),
  unique(group_id, category_id, month)
);

-- Savings goals
create table public.savings_goals (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  target_amount integer not null,
  current_amount integer not null default 0,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  deadline date,
  icon text not null default 'PiggyBank',
  color text not null default '#E8D5A8',
  created_at timestamptz not null default now()
);

-- Exchange rates
create table public.exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null default 'USD',
  to_currency text not null default 'ARS',
  rate_type text not null default 'blue' check (rate_type = 'blue'),
  buy_rate numeric(12,4) not null,
  sell_rate numeric(12,4) not null,
  source text not null default 'dolarhoy.com',
  fetched_at timestamptz not null default now(),
  manual_override boolean not null default false
);

-- Health scores
create table public.health_scores (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  breakdown jsonb not null default '{}',
  calculated_at timestamptz not null default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('budget_alert', 'ai_tip', 'invite', 'system')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Group invites
create table public.group_invites (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references public.users(id),
  email text,
  role text not null default 'member' check (role in ('member', 'viewer')),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_transactions_group_date on public.transactions(group_id, date desc);
create index idx_transactions_user on public.transactions(user_id);
create index idx_transactions_category on public.transactions(category_id);
create index idx_budgets_group_month on public.budgets(group_id, month);
create index idx_notifications_user_unread on public.notifications(user_id) where read = false;
create index idx_exchange_rates_latest on public.exchange_rates(fetched_at desc);

-- RLS Policies
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.health_scores enable row level security;
alter table public.notifications enable row level security;
alter table public.group_invites enable row level security;

-- Users: can read/update own profile
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
-- Users: can see others in same group
create policy "users_select_group_members" on public.users for select using (
  id in (select gm.user_id from public.group_members gm where gm.group_id in (
    select group_id from public.group_members where user_id = auth.uid()
  ))
);

-- Groups: members can read
create policy "groups_select" on public.groups for select using (
  id in (select group_id from public.group_members where user_id = auth.uid())
);
create policy "groups_insert" on public.groups for insert with check (auth.uid() = created_by);
create policy "groups_update" on public.groups for update using (
  id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
);

-- Group members
create policy "group_members_select" on public.group_members for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
create policy "group_members_insert" on public.group_members for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
  or user_id = auth.uid()
);
create policy "group_members_delete" on public.group_members for delete using (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
  or user_id = auth.uid()
);

-- Categories
create policy "categories_select" on public.categories for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
create policy "categories_insert" on public.categories for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);
create policy "categories_update" on public.categories for update using (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);

-- Transactions
create policy "transactions_select" on public.transactions for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
  and (is_shared = true or user_id = auth.uid())
);
create policy "transactions_insert" on public.transactions for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
  and user_id = auth.uid()
);
create policy "transactions_update" on public.transactions for update using (
  user_id = auth.uid()
  or group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
);
create policy "transactions_delete" on public.transactions for delete using (
  user_id = auth.uid()
  or group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
);

-- Budgets
create policy "budgets_select" on public.budgets for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
create policy "budgets_insert" on public.budgets for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);
create policy "budgets_update" on public.budgets for update using (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);

-- Savings goals
create policy "goals_select" on public.savings_goals for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
create policy "goals_insert" on public.savings_goals for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);
create policy "goals_update" on public.savings_goals for update using (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member'))
);

-- Exchange rates
create policy "exchange_rates_select" on public.exchange_rates for select using (auth.role() = 'authenticated');

-- Health scores
create policy "health_scores_select" on public.health_scores for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);

-- Notifications
create policy "notifications_select" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_update" on public.notifications for update using (user_id = auth.uid());

-- Group invites
create policy "invites_select" on public.group_invites for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
);
create policy "invites_insert" on public.group_invites for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
);

-- Function: create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
