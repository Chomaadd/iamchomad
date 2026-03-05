import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type MusicTrackInput, type MusicTrackUpdateInput } from "@shared/routes";

export function useMusicTracks() {
  return useQuery({
    queryKey: [api.music.list.path],
    queryFn: async () => {
      const res = await fetch(api.music.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch music tracks");
      return api.music.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMusicTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MusicTrackInput) => {
      const res = await fetch(api.music.create.path, {
        method: api.music.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create track");
      return api.music.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.music.list.path] }),
  });
}

export function useUpdateMusicTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MusicTrackUpdateInput }) => {
      const url = buildUrl(api.music.update.path, { id });
      const res = await fetch(url, {
        method: api.music.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update track");
      return api.music.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.music.list.path] }),
  });
}

export function useDeleteMusicTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.music.delete.path, { id });
      const res = await fetch(url, { method: api.music.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete track");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.music.list.path] }),
  });
}
