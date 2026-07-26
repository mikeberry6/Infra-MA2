import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity } from "@/modules/auth/guards";

export interface AuditInput {
  entityType: string;
  entityId?: string | null;
  action: string;
  changes?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  actorId?: string | null;
}

type AuditClient = Pick<PrismaClient, "auditEvent"> | Pick<Prisma.TransactionClient, "auditEvent">;

export async function recordAuditEvent(
  input: AuditInput,
  client: AuditClient = prisma,
): Promise<string> {
  const identity = input.actorId === undefined ? await getSessionIdentity() : null;
  const event = await client.auditEvent.create({
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
