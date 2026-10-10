import { useEffect, useState } from "react";
import { supabase, isConfigured } from "./supabase";
import { DEFAULT_SETTINGS, type Property, type Settings } from "./types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS, ready: !isConfigured });
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(data ?? {}), ready: true });
    });
  }, []);
  return settings;
}

type Status = "loading" | "ready" | "error";

/** Biens publiés. `limit` : nombre max (accueil = 3). `excludeId` : exclut un bien (fiche → « عقارات اخرى »). */
export function usePublishedProperties(opts: { limit?: number; excludeId?: string } = {}) {
  const { limit, excludeId } = opts;
  const [items, setItems] = useState<Property[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  useEffect(() => {
    if (!isConfigured) { setStatus("error"); return; }
    setStatus("loading");
    let q = supabase.from("properties").select("*").eq("published", true)
      .order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (excludeId) q = q.neq("id", excludeId);
    if (limit) q = q.limit(limit);
    q.then(({ data, error }) => {
      if (error) setStatus("error");
      else { setItems((data ?? []) as Property[]); setStatus("ready"); }
    });
  }, [limit, excludeId]);
  return { items, status };
}

export function useProperty(id: string | undefined) {
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  useEffect(() => {
    setProperty(undefined);
    if (!id || !isConfigured) { setProperty(null); return; }
    supabase.from("properties").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => setProperty((data as Property) ?? null));
  }, [id]);
  return property;
}
