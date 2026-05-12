-- Fix infinite recursion in group_members RLS policies
-- The problem: group_members policies query group_members, causing circular evaluation.
-- Solution: a security definer function that bypasses RLS to get user's group IDs.

create or replace function public.get_user_group_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select group_id from public.group_members where user_id = auth.uid();
$$;

create or replace function public.get_user_owner_group_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select group_id from public.group_members where user_id = auth.uid() and role = 'owner';
$$;

create or replace function public.get_user_member_group_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'member');
$$;

-- Drop all existing policies that reference group_members
drop policy if exists "users_select_group_members" on public.users;
drop policy if exists "groups_select" on public.groups;
drop policy if exists "groups_insert" on public.groups;
drop policy if exists "groups_update" on public.groups;
drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "group_members_insert" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;
drop policy if exists "categories_select" on public.categories;
drop policy if exists "categories_insert" on public.categories;
drop policy if exists "categories_update" on public.categories;
drop policy if exists "transactions_select" on public.transactions;
drop policy if exists "transactions_insert" on public.transactions;
drop policy if exists "transactions_update" on public.transactions;
drop policy if exists "transactions_delete" on public.transactions;
drop policy if exists "budgets_select" on public.budgets;
drop policy if exists "budgets_insert" on public.budgets;
drop policy if exists "budgets_update" on public.budgets;
drop policy if exists "goals_select" on public.savings_goals;
drop policy if exists "goals_insert" on public.savings_goals;
drop policy if exists "goals_update" on public.savings_goals;
drop policy if exists "health_scores_select" on public.health_scores;
drop policy if exists "invites_select" on public.group_invites;
drop policy if exists "invites_insert" on public.group_invites;

-- Recreate policies using the security definer functions

-- Users: can see others in same group
create policy "users_select_group_members" on public.users for select using (
  id in (select gm.user_id from public.group_members gm where gm.group_id in (select public.get_user_group_ids()))
);

-- Groups
create policy "groups_select" on public.groups for select using (
  id in (select public.get_user_group_ids())
  or created_by = auth.uid()
);
create policy "groups_insert" on public.groups for insert with check (
  created_by = auth.uid()
);
create policy "groups_update" on public.groups for update using (
  id in (select public.get_user_owner_group_ids())
);

-- Group members (this was the main recursive one)
create policy "group_members_select" on public.group_members for select using (
  group_id in (select public.get_user_group_ids())
);
create policy "group_members_insert" on public.group_members for insert with check (
  group_id in (select public.get_user_owner_group_ids())
  or user_id = auth.uid()
);
create policy "group_members_delete" on public.group_members for delete using (
  group_id in (select public.get_user_owner_group_ids())
  or user_id = auth.uid()
);

-- Categories
create policy "categories_select" on public.categories for select using (
  group_id in (select public.get_user_group_ids())
);
create policy "categories_insert" on public.categories for insert with check (
  group_id in (select public.get_user_member_group_ids())
);
create policy "categories_update" on public.categories for update using (
  group_id in (select public.get_user_member_group_ids())
);

-- Transactions
create policy "transactions_select" on public.transactions for select using (
  group_id in (select public.get_user_group_ids())
  and (is_shared = true or user_id = auth.uid())
);
create policy "transactions_insert" on public.transactions for insert with check (
  group_id in (select public.get_user_member_group_ids())
  and user_id = auth.uid()
);
create policy "transactions_update" on public.transactions for update using (
  user_id = auth.uid()
  or group_id in (select public.get_user_owner_group_ids())
);
create policy "transactions_delete" on public.transactions for delete using (
  user_id = auth.uid()
  or group_id in (select public.get_user_owner_group_ids())
);

-- Budgets
create policy "budgets_select" on public.budgets for select using (
  group_id in (select public.get_user_group_ids())
);
create policy "budgets_insert" on public.budgets for insert with check (
  group_id in (select public.get_user_member_group_ids())
);
create policy "budgets_update" on public.budgets for update using (
  group_id in (select public.get_user_member_group_ids())
);

-- Savings goals
create policy "goals_select" on public.savings_goals for select using (
  group_id in (select public.get_user_group_ids())
);
create policy "goals_insert" on public.savings_goals for insert with check (
  group_id in (select public.get_user_member_group_ids())
);
create policy "goals_update" on public.savings_goals for update using (
  group_id in (select public.get_user_member_group_ids())
);

-- Health scores
create policy "health_scores_select" on public.health_scores for select using (
  group_id in (select public.get_user_group_ids())
);

-- Group invites
create policy "invites_select" on public.group_invites for select using (
  group_id in (select public.get_user_owner_group_ids())
);
create policy "invites_insert" on public.group_invites for insert with check (
  group_id in (select public.get_user_owner_group_ids())
);
