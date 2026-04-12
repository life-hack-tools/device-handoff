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
export declare function restoreRecords<LocalRecord, RemoteRecord>({ fetchRemoteRecords, getLocalRecords, saveLocalRecord, toLocalRecord, getId, getUniqueKey, getUpdatedAt, resolveConflict, }: RestoreRecordsOptions<LocalRecord, RemoteRecord>): Promise<HandoffResult>;
//# sourceMappingURL=restore.d.ts.map