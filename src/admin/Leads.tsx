import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminLeads, useUpdateLead } from "@/admin/adminQueries";
import {
  LEAD_STATUS_LABELS,
  LEAD_TYPE_LABELS,
  type Lead,
  type LeadStatus,
  type LeadType,
} from "@/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPES = Object.keys(LEAD_TYPE_LABELS) as LeadType[];
const STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

/** Escapes a value for CSV: quotes it and doubles any inner quote. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function Leads() {
  const { data: leads = [], isLoading } = useAdminLeads();
  const update = useUpdateLead();
  const [type, setType] = useState<LeadType | "all">("all");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (type === "all" || lead.type === type) &&
          (status === "all" || lead.status === status),
      ),
    [leads, type, status],
  );

  /**
   * CSV export. This is the deliverable when a lead package is sold, so it
   * carries the qualifying answers too — a bare email list is worth far less
   * than one that says "robot vacuum, ₪4–7k budget, has a dog".
   */
  const exportCsv = () => {
    const header = [
      "created_at",
      "type",
      "name",
      "email",
      "phone",
      "city",
      "status",
      "payload",
      "source_path",
    ];
    const rows = visible.map((lead) =>
      [
        lead.created_at,
        LEAD_TYPE_LABELS[lead.type],
        lead.name,
        lead.email,
        lead.phone,
        lead.city,
        LEAD_STATUS_LABELS[lead.status],
        JSON.stringify(lead.payload),
        lead.source_path,
      ]
        .map(csvCell)
        .join(","),
    );

    // The BOM makes Excel open Hebrew as UTF-8 instead of mojibake.
    const blob = new Blob(["﻿" + [header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">לידים</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <bdi>{visible.length}</bdi> מתוך <bdi>{leads.length}</bdi>
          </p>
        </div>
        <Button onClick={exportCsv} variant="outline" disabled={visible.length === 0}>
          <Download className="size-4" />
          ייצוא ל-CSV
        </Button>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as LeadType | "all")}
          aria-label="סינון לפי סוג"
          className="h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground"
        >
          <option value="all">כל הסוגים</option>
          {TYPES.map((value) => (
            <option key={value} value={value}>
              {LEAD_TYPE_LABELS[value]}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadStatus | "all")}
          aria-label="סינון לפי סטטוס"
          className="h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground"
        >
          <option value="all">כל הסטטוסים</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {LEAD_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">אין לידים שתואמים לסינון.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              open={open === lead.id}
              onToggle={() => setOpen(open === lead.id ? null : lead.id)}
              onStatus={(next) => update.mutate({ id: lead.id, status: next })}
              onNotes={(notes) => update.mutate({ id: lead.id, notes })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  open,
  onToggle,
  onStatus,
  onNotes,
}: {
  lead: Lead;
  open: boolean;
  onToggle: () => void;
  onStatus: (status: LeadStatus) => void;
  onNotes: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const details = Object.entries(lead.payload ?? {});

  return (
    <li className="rounded-card border border-border bg-background">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-start"
      >
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            lead.status === "new" ? "bg-signal" : "bg-border",
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium" dir="ltr">
            {lead.email ?? lead.phone ?? lead.name ?? "—"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {LEAD_TYPE_LABELS[lead.type]} · {timeAgo(lead.created_at)}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs">
          {LEAD_STATUS_LABELS[lead.status]}
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {lead.name && <Detail label="שם" value={lead.name} />}
            {lead.phone && <Detail label="טלפון" value={lead.phone} ltr />}
            {lead.city && <Detail label="עיר" value={lead.city} />}
            {lead.source_path && (
              <Detail label="הגיע מהעמוד" value={lead.source_path} ltr />
            )}
            {details.map(([key, value]) => (
              <Detail key={key} label={key} value={String(value)} />
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatus(value)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm transition-colors",
                  lead.status === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {LEAD_STATUS_LABELS[value]}
              </button>
            ))}
          </div>

          <label
            htmlFor={`notes-${lead.id}`}
            className="mt-5 block text-xs font-medium text-muted-foreground"
          >
            הערות
          </label>
          <textarea
            id={`notes-${lead.id}`}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => notes !== (lead.notes ?? "") && onNotes(notes)}
            placeholder="מה סוכם, למי נמכר, מתי לחזור…"
            className="mt-2 w-full rounded-card border border-input bg-background p-3 text-sm outline-none focus:border-foreground"
          />
        </div>
      )}
    </li>
  );
}

function Detail({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
