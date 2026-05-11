import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Group, GroupMember } from '@/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  members: GroupMember[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  setActiveGroup: (group: Group) => void;
  createGroup: (name: string, type: Group['type']) => Promise<Group>;
  inviteMember: (email: string, role: 'member' | 'viewer') => Promise<void>;
  fetchMembers: () => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  members: [],
  loading: true,

  fetchGroups: async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('created_at');
    const groups = data ?? [];
    const active = groups[0] ?? null;
    set({ groups, activeGroup: active, loading: false });
    if (active) get().fetchMembers();
  },

  setActiveGroup: (group) => {
    set({ activeGroup: group });
    get().fetchMembers();
  },

  createGroup: async (name, type) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, type, created_by: user.id })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('group_members').insert({
      user_id: user.id,
      group_id: group.id,
      role: 'owner',
    });

    const cats = DEFAULT_CATEGORIES.map((c, i) => ({
      group_id: group.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      sort_order: i,
    }));
    await supabase.from('categories').insert(cats);

    set((s) => ({ groups: [...s.groups, group], activeGroup: group }));
    return group;
  },

  inviteMember: async (email, role) => {
    const { activeGroup } = get();
    if (!activeGroup) throw new Error('No active group');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase.from('group_invites').insert({
      group_id: activeGroup.id,
      invited_by: user.id,
      email,
      role,
    });
  },

  fetchMembers: async () => {
    const { activeGroup } = get();
    if (!activeGroup) return;
    const { data } = await supabase
      .from('group_members')
      .select('*, user:users(*)')
      .eq('group_id', activeGroup.id);
    set({ members: data ?? [] });
  },
}));
