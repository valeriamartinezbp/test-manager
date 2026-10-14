import { Prisma } from "./generated/prisma/client";

/** Prefijos de clave y su número mínimo de dígitos (TC-001, TP-01…). */
export const KEY_FORMATS = {
  REQ: 3,
  TP: 2,
  TS: 2,
  TC: 3,
  CY: 2,
  EJ: 3,
  BUG: 3,
} as const;

export type KeyPrefix = keyof typeof KEY_FORMATS;

export function formatKey(prefix: KeyPrefix, value: number): string {
  return `${prefix}-${String(value).padStart(KEY_FORMATS[prefix], "0")}`;
}

function isKnownError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

async function incrementCounter(
  tx: Prisma.TransactionClient,
  projectId: string,
  prefix: KeyPrefix,
): Promise<number> {
  const where = { projectId_prefix: { projectId, prefix } };
  const increment = () =>
    tx.keyCounter.update({ where, data: { lastValue: { increment: 1 } } });
  try {
    // UPDATE … SET lastValue = lastValue + 1: atómico y bloquea la fila hasta el commit.
    return (await increment()).lastValue;
  } catch (error) {
    if (!isKnownError(error, "P2025")) throw error; // P2025: el contador no existe
  }
  try {
    return (
      await tx.keyCounter.create({ data: { projectId, prefix, lastValue: 1 } })
    ).lastValue;
  } catch (error) {
    if (!isKnownError(error, "P2002")) throw error; // P2002: otro proceso lo creó primero
    return (await increment()).lastValue;
  }
}

/**
 * Siguiente clave legible del proyecto (TC-013, BUG-103…). Llamar SIEMPRE dentro de la
 * misma transacción que crea el registro, para que no haya huecos ni duplicados:
 *
 *   await db.$transaction(async (tx) => {
 *     const key = await nextKey(tx, projectId, "TC");
 *     await tx.testCase.create({ data: { key, … } });
 *   });
 */
export async function nextKey(
  tx: Prisma.TransactionClient,
  projectId: string,
  prefix: KeyPrefix,
): Promise<string> {
  return formatKey(prefix, await incrementCounter(tx, projectId, prefix));
}
