// src/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client — drop this into src/ alongside your
// RequirementsAgent.jsx. Reads credentials from Vite env vars.
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('Supabase env vars missing — persistence disabled.');
}

export const supabase = (url && key) ? createClient(url, key) : null;

// ─── Session helpers ──────────────────────────────────────────

export async function saveSession({ id, projectTitle, status, data }) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('procurement_sessions')
    .upsert({
      id,
      project_title: projectTitle || 'Untitled',
      status,
      data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  if (error) console.error('Supabase save error:', error);
  return !error;
}

export async function loadSessions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('procurement_sessions')
    .select('id, project_title, status, updated_at')
    .order('updated_at', { ascending: false });
  if (error) { console.error('Supabase load error:', error); return []; }
  return data || [];
}

export async function loadSession(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('procurement_sessions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('Supabase load error:', error); return null; }
  return data;
}

export async function deleteSession(id) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('procurement_sessions')
    .delete()
    .eq('id', id);
  if (error) console.error('Supabase delete error:', error);
  return !error;
}
