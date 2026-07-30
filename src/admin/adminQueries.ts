import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Guide,
  Lead,
  LeadStatus,
  Robot,
  StoreAdmin,
} from "@/types";

/** Signed-in admins may select every column — RLS allows it, `anon` cannot. */
export function useAdminStores() {
  return useQuery({
    queryKey: ["admin", "stores"],
    queryFn: async (): Promise<StoreAdmin[]> => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("sort");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: { id: string; status?: LeadStatus; notes?: string }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}

export function useAdminRobots() {
  return useQuery({
    queryKey: ["admin", "robots"],
    queryFn: async (): Promise<Robot[]> => {
      const { data, error } = await supabase
        .from("robots")
        .select("*")
        .order("sort");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateRobot() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Robot> & { id: string }) => {
      const { error } = await supabase.from("robots").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin", "robots"] });
      client.invalidateQueries({ queryKey: ["robots"] });
      client.invalidateQueries({ queryKey: ["robot"] });
    },
  });
}

export function useAdminGuides() {
  return useQuery({
    queryKey: ["admin", "guides"],
    queryFn: async (): Promise<Guide[]> => {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Flips a draft to published and back, from the list view. */
export function useTogglePublish(table: "robots" | "guides") {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", table] }),
  });
}

export function useUpdateStore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<StoreAdmin> & { id: string }) => {
      const { error } = await supabase.from("stores").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "stores"] }),
  });
}

export interface ClickRow {
  id: string;
  created_at: string;
  store_id: string | null;
  robot_id: string | null;
  offer_id: string | null;
}

export function useAdminClicks(days = 30) {
  return useQuery({
    queryKey: ["admin", "clicks", days],
    queryFn: async (): Promise<ClickRow[]> => {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("clicks")
        .select("id, created_at, store_id, robot_id, offer_id")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Admin view of offers, including the affiliate columns. */
export function useAdminOffers(robotId?: string) {
  return useQuery({
    queryKey: ["admin", "offers", robotId],
    enabled: Boolean(robotId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("robot_id", robotId!)
        .order("price");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveOffer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (offer: {
      id?: string;
      robot_id: string;
      store_id: string;
      price: number | null;
      in_stock: boolean;
      shipping_note: string | null;
      product_url: string;
      affiliate_url: string;
    }) => {
      const { error } = offer.id
        ? await supabase.from("offers").update(offer).eq("id", offer.id)
        : await supabase.from("offers").insert(offer);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "offers"] }),
  });
}

export function useDeleteOffer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "offers"] }),
  });
}
