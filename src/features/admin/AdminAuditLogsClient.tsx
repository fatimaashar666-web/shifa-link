"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

interface AuditEventItem {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export function AdminAuditLogsClient() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionQuery, setActionQuery] = useState("");
  const [entityTypeQuery, setEntityTypeQuery] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionQuery.trim()) params.append("action", actionQuery.trim());
      if (entityTypeQuery.trim()) params.append("entityType", entityTypeQuery.trim());

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed.");
      const data = (await res.json()) as { events: AuditEventItem[] };
      setEvents(data.events ?? []);
    } catch {
      alert("Error searching audit logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={actionQuery}
            onChange={(e) => setActionQuery(e.target.value)}
            placeholder="Filter by action (e.g. record, booking, auth)…"
            className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
          />
          <input
            type="text"
            value={entityTypeQuery}
            onChange={(e) => setEntityTypeQuery(e.target.value)}
            placeholder="Entity type (e.g. User, FileObject, Appointment)…"
            className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
          />
          <Button type="submit" size="sm" disabled={loading} className="gap-1.5 text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Search Audit Trail
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {events.length === 0 && !loading && (
          <p className="text-center py-8 text-xs text-slate-400">
            Enter a query above or click Search to view recent system audit logs.
          </p>
        )}

        {events.map((ev) => (
          <Card key={ev.id} className="p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {ev.action}
                </Badge>
                <span className="text-slate-500 font-mono text-[10px]">{ev.entityType}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 dark:text-slate-400">
              <span>Actor: {ev.actorType} ({ev.actorId?.slice(0, 8) ?? "System"})</span>
              {ev.ipAddress && <span>IP: {ev.ipAddress}</span>}
              {ev.entityId && <span>Entity ID: {ev.entityId.slice(0, 8)}…</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
