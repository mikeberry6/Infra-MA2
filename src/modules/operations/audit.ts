import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/modules/auth/guards";

interface AuditInput {
  entityType: string;
  entityId?: string | null;
  action: string;
  changes?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  actorId?: string | null;
}

export async function recordAuditEvent(input: AuditInput): Promise<string> {
  const identity = input.actorId === undefined ? await getSessionIdentity() : null;
  const event = await prisma.auditEvent.create({
    data: {
      actorId: input.actorId === undefined ? identity?.id ?? null : input.actorId,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      action: input.action,
      changes: input.changes,
      metadata: input.metadata,
    },
    select: { id: true },
  });
  return event.id;
}
