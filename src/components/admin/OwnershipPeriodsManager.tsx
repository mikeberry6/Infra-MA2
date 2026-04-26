"use client";

import { useState, useTransition } from "react";
import {
  addOwnershipPeriod,
  updateOwnershipPeriod,
  deleteOwnershipPeriod,
} from "@/modules/admin/actions";

export interface OwnershipPeriodRow {
  id: string;
  investmentFirm: string;
  ownershipVehicle: string;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  stake: string | null;
}

export function OwnershipPeriodsManager({
  companyId,
  initialPeriods,
}: {
  companyId: string;
  initialPeriods: OwnershipPeriodRow[];
}) {
  const [periods, setPeriods] = useState(initialPeriods);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshError(msg?: string) {
    setError(msg ?? null);
  }

  function handleAdd(formData: FormData) {
    refreshError();
    startTransition(async () => {
      const result = await addOwnershipPeriod(companyId, formData);
      if (!result.success) {
        refreshError(result.error || "Failed to add owner");
        return;
      }
      // Update list in place — the simplest correct path is to ask the
      // user to reload, since reading the new row needs another fetch.
      setEditingId(null);
      window.location.reload();
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    refreshError();
    startTransition(async () => {
      const result = await updateOwnershipPeriod(id, formData);
      if (!result.success) {
        refreshError(result.error || "Failed to update owner");
        return;
      }
      setEditingId(null);
      window.location.reload();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this ownership period?")) return;
    refreshError();
    startTransition(async () => {
      const result = await deleteOwnershipPeriod(id);
      if (!result.success) {
        refreshError(result.error || "Failed to delete owner");
        return;
      }
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">Ownership History</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Every firm that has owned this company. The &quot;Active&quot; period drives the table-view firm column.
          </p>
        </div>
        {editingId !== "new" && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="text-xs px-3 py-1.5 bg-[#3F3F46] hover:bg-[#52525B] rounded"
          >
            + Add owner
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700 rounded text-xs text-red-200">
          {error}
        </div>
      )}

      {editingId === "new" && (
        <OwnershipForm
          mode="add"
          onSubmit={handleAdd}
          onCancel={() => setEditingId(null)}
          isPending={isPending}
        />
      )}

      <div className="space-y-2 mt-3">
        {periods.length === 0 && editingId !== "new" && (
          <p className="text-xs text-[#71717A]">No ownership periods recorded.</p>
        )}
        {periods.map((p) =>
          editingId === p.id ? (
            <OwnershipForm
              key={p.id}
              mode="edit"
              initial={p}
              onSubmit={(fd) => handleUpdate(p.id, fd)}
              onCancel={() => setEditingId(null)}
              isPending={isPending}
            />
          ) : (
            <div
              key={p.id}
              className="flex items-center justify-between bg-[#0F0F11] border border-[#27272A] rounded px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                    p.isActive ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.investmentFirm}</div>
                  <div className="text-xs text-[#71717A] truncate">
                    {p.ownershipVehicle || "—"}
                    {p.investmentYear ? ` · ${p.investmentYear}` : ""}
                    {p.exitYear ? `–${p.exitYear}` : p.isActive && p.investmentYear ? "–Present" : ""}
                    {p.stake ? ` · ${p.stake}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(p.id)}
                  className="text-xs px-2 py-1 bg-[#27272A] hover:bg-[#3F3F46] rounded"
                  disabled={isPending}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-xs px-2 py-1 bg-red-900/40 hover:bg-red-900/70 text-red-200 rounded"
                  disabled={isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function OwnershipForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  mode: "add" | "edit";
  initial?: OwnershipPeriodRow;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <form
      action={onSubmit}
      className="bg-[#0F0F11] border border-[#3F3F46] rounded p-3 space-y-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="text-xs space-y-1">
          <span className="block text-[#A1A1AA]">Investment firm *</span>
          <input
            name="investmentFirm"
            defaultValue={initial?.investmentFirm ?? ""}
            required
            className="w-full bg-[#18181B] border border-[#27272A] px-2 py-1 rounded"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="block text-[#A1A1AA]">Ownership vehicle (fund name)</span>
          <input
            name="ownershipVehicle"
            defaultValue={initial?.ownershipVehicle ?? ""}
            className="w-full bg-[#18181B] border border-[#27272A] px-2 py-1 rounded"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="block text-[#A1A1AA]">Investment year</span>
          <input
            name="investmentYear"
            type="number"
            defaultValue={initial?.investmentYear ?? ""}
            className="w-full bg-[#18181B] border border-[#27272A] px-2 py-1 rounded"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="block text-[#A1A1AA]">Exit year (blank if active)</span>
          <input
            name="exitYear"
            type="number"
            defaultValue={initial?.exitYear ?? ""}
            className="w-full bg-[#18181B] border border-[#27272A] px-2 py-1 rounded"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="block text-[#A1A1AA]">Stake (e.g. &quot;30%&quot;)</span>
          <input
            name="stake"
            defaultValue={initial?.stake ?? ""}
            className="w-full bg-[#18181B] border border-[#27272A] px-2 py-1 rounded"
          />
        </label>
        <label className="text-xs flex items-center gap-2 mt-5">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={initial?.isActive ?? true}
          />
          <span className="text-[#A1A1AA]">Currently owns this company</span>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded disabled:opacity-50"
        >
          {mode === "add" ? "Add owner" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
