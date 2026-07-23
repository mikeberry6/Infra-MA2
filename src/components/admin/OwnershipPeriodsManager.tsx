"use client";

import { useState, useTransition } from "react";
import {
  addOwnershipPeriod,
  updateOwnershipPeriod,
  deleteOwnershipPeriod,
} from "@/modules/admin/actions";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { Tag } from "@/components/shared/Tag";
import {
  CheckboxOption,
  FormField,
  FormMessage,
} from "@/components/shared/FormControls";
import { invalidateDetailCache } from "@/lib/detail-cache-events";

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
      invalidateDetailCache("company", companyId);
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
      invalidateDetailCache("company", companyId);
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
      invalidateDetailCache("company", companyId);
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <section className="surface mt-6 p-5" aria-labelledby="ownership-history-heading">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="ownership-history-heading" className="text-base font-semibold">
            Ownership History
          </h2>
          <p className="mt-0.5 type-micro">
            Every firm that has owned this company. The &quot;Active&quot; period drives the table-view firm column.
          </p>
        </div>
        {editingId !== "new" && (
          <Button type="button" size="sm" onClick={() => setEditingId("new")}>
            + Add owner
          </Button>
        )}
      </div>

      {error && (
        <FormMessage tone="error" className="mb-3">
          {error}
        </FormMessage>
      )}

      {editingId === "new" && (
        <OwnershipForm
          mode="add"
          onSubmit={handleAdd}
          onCancel={() => setEditingId(null)}
          isPending={isPending}
        />
      )}

      <div className="mt-3 space-y-2">
        {periods.length === 0 && editingId !== "new" && (
          <p className="type-micro">No ownership periods recorded.</p>
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
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{p.investmentFirm}</span>
                    <Tag
                      variant="dot"
                      color={p.isActive ? "#008253" : "#6b6b75"}
                    >
                      {p.isActive ? "Active" : "Historical"}
                    </Tag>
                  </div>
                  <div className="mt-0.5 truncate type-micro">
                    {p.ownershipVehicle || "—"}
                    {p.investmentYear ? ` · ${p.investmentYear}` : ""}
                    {p.exitYear ? `–${p.exitYear}` : p.isActive && p.investmentYear ? "–Present" : ""}
                    {p.stake ? ` · ${p.stake}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(p.id)}
                  disabled={isPending}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
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
      className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] p-4"
      aria-busy={isPending}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormField htmlFor={`ownership-${mode}-firm`} label="Investment firm" required>
          <TextInput
            id={`ownership-${mode}-firm`}
            size="md"
            name="investmentFirm"
            defaultValue={initial?.investmentFirm ?? ""}
            required
          />
        </FormField>
        <FormField htmlFor={`ownership-${mode}-vehicle`} label="Ownership vehicle (fund name)">
          <TextInput
            id={`ownership-${mode}-vehicle`}
            size="md"
            name="ownershipVehicle"
            defaultValue={initial?.ownershipVehicle ?? ""}
          />
        </FormField>
        <FormField htmlFor={`ownership-${mode}-investment-year`} label="Investment year">
          <TextInput
            id={`ownership-${mode}-investment-year`}
            size="md"
            name="investmentYear"
            type="number"
            defaultValue={initial?.investmentYear ?? ""}
          />
        </FormField>
        <FormField htmlFor={`ownership-${mode}-exit-year`} label="Exit year (blank if active)">
          <TextInput
            id={`ownership-${mode}-exit-year`}
            size="md"
            name="exitYear"
            type="number"
            defaultValue={initial?.exitYear ?? ""}
          />
        </FormField>
        <FormField htmlFor={`ownership-${mode}-stake`} label="Stake (e.g. 30%)">
          <TextInput
            id={`ownership-${mode}-stake`}
            size="md"
            name="stake"
            defaultValue={initial?.stake ?? ""}
          />
        </FormField>
        <div className="self-end">
          <CheckboxOption
            name="isActive"
            value="true"
            defaultChecked={initial?.isActive ?? true}
          >
            Currently owns this company
          </CheckboxOption>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={isPending}
        >
          {mode === "add" ? "Add owner" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
