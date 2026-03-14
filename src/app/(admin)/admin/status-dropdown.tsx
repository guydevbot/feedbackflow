"use client";

import { useState } from "react";
import { STATUS_CONFIG, type Status } from "@/lib/utils";

const STATUSES = Object.keys(STATUS_CONFIG) as Status[];

export function AdminStatusDropdown({
  feedbackId,
  currentStatus,
}: {
  feedbackId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status;
    setUpdating(true);

    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
      }
    } catch {
      // Revert on error
    } finally {
      setUpdating(false);
    }
  }

  const config = STATUS_CONFIG[status];

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={updating}
      className="rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors disabled:opacity-50"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--muted)",
        color: config.color,
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
}
