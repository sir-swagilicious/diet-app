"use client";

import { checkHealth, getAuthToken, getAuthUser } from "@/services/api";
import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      try {
        await checkHealth();
        if (!cancelled) setStatus("online");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  return (
    <div
      className="api-status-bar"
      style={{
        fontSize: 12,
        color: status === "online" ? "#027a48" : "#b54708",
        marginBottom: 12,
      }}
    >
      API {status === "online" ? "connected" : "offline"}
      {getAuthToken()
        ? ` · ${getAuthUser()?.email ?? "logged in"}`
        : " · not logged in"}
    </div>
  );
}
