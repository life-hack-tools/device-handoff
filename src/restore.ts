export type HandoffMergeAction = 'imported' | 'updated' | 'skipped';

export interface HandoffResult {
  imported: number;
  updated: number;
  skipped: number;
}

export interface RestoreRecordsOptions<LocalRecord, RemoteRecord> {
  fetchRemoteRecords: () => Promise<RemoteRecord[]>;
  getLocalRecords: () => Promise<LocalRecord[]>;
  saveLocalRecord: (record: LocalRecord) => Promise<void>;
  toLocalRecord: (remote: RemoteRecord) => LocalRecord | null;
  getId: (record: LocalRecord) => string;
  getUniqueKey: (record: LocalRecord) => string;
  getUpdatedAt: (record: LocalRecord) => string;
  resolveConflict?: (params: {
    local: LocalRecord;
    incoming: LocalRecord;
  }) => LocalRecord | null;
}

function isIncomingNewer<LocalRecord>(
  local: LocalRecord,
  incoming: LocalRecord,
  getUpdatedAt: (record: LocalRecord) => string,
): boolean {
  return Date.parse(getUpdatedAt(incoming)) > Date.parse(getUpdatedAt(local));
}

export async function restoreRecords<LocalRecord, RemoteRecord>({
  fetchRemoteRecords,
  getLocalRecords,
  saveLocalRecord,
  toLocalRecord,
  getId,
  getUniqueKey,
  getUpdatedAt,
  resolveConflict,
}: RestoreRecordsOptions<LocalRecord, RemoteRecord>): Promise<HandoffResult> {
  const [remoteRecords, localRecords] = await Promise.all([
    fetchRemoteRecords(),
    getLocalRecords(),
  ]);

  const byId = new Map(localRecords.map((record) => [getId(record), record]));
  const byUniqueKey = new Map(localRecords.map((record) => [getUniqueKey(record), record]));
  const result: HandoffResult = { imported: 0, updated: 0, skipped: 0 };

  for (const remote of remoteRecords) {
    const incoming = toLocalRecord(remote);
    if (!incoming) {
      result.skipped++;
      continue;
    }

    const existing = byId.get(getId(incoming)) ?? byUniqueKey.get(getUniqueKey(incoming));
    if (!existing) {
      await saveLocalRecord(incoming);
      byId.set(getId(incoming), incoming);
      byUniqueKey.set(getUniqueKey(incoming), incoming);
      result.imported++;
      continue;
    }

    const resolved = resolveConflict
      ? resolveConflict({ local: existing, incoming })
      : isIncomingNewer(existing, incoming, getUpdatedAt) ? incoming : null;

    if (!resolved) {
      result.skipped++;
      continue;
    }

    await saveLocalRecord(resolved);
    byId.delete(getId(existing));
    byUniqueKey.delete(getUniqueKey(existing));
    byId.set(getId(resolved), resolved);
    byUniqueKey.set(getUniqueKey(resolved), resolved);
    result.updated++;
  }

  return result;
}
