"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreRecords = restoreRecords;
function isIncomingNewer(local, incoming, getUpdatedAt) {
    return Date.parse(getUpdatedAt(incoming)) > Date.parse(getUpdatedAt(local));
}
async function restoreRecords({ fetchRemoteRecords, getLocalRecords, saveLocalRecord, toLocalRecord, getId, getUniqueKey, getUpdatedAt, resolveConflict, }) {
    const [remoteRecords, localRecords] = await Promise.all([
        fetchRemoteRecords(),
        getLocalRecords(),
    ]);
    const byId = new Map(localRecords.map((record) => [getId(record), record]));
    const byUniqueKey = new Map(localRecords.map((record) => [getUniqueKey(record), record]));
    const result = { imported: 0, updated: 0, skipped: 0 };
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
//# sourceMappingURL=restore.js.map