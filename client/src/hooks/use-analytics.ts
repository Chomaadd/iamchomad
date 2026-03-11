import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";

export function usePageTracker() {
  const [location] = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (lastTracked.current === location) return;
    lastTracked.current = location;

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: location }),
    }).catch(() => {});
  }, [location]);
}

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    refetchInterval: 30000,
  });
}
