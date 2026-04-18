export declare const DEFAULT_HANDOFF_TYPE = "life-hack-tools-device-handoff";
export declare const DEFAULT_HANDOFF_VERSION = 1;
export interface DeviceHandoffPayloadOptions {
    type?: string;
    version?: number;
    validateValue?: (value: string) => boolean;
    validateDeviceId?: (value: string) => boolean;
}
export declare function createHandoffPayload(value: string, options?: DeviceHandoffPayloadOptions): string;
export declare function parseHandoffPayload(value: string, options?: DeviceHandoffPayloadOptions): string | null;
export declare function isLikelyDeviceId(value: string): boolean;
export declare const createDeviceHandoffPayload: typeof createHandoffPayload;
export declare const parseDeviceHandoffPayload: typeof parseHandoffPayload;
export declare const isLikelyHandoffValue: typeof isLikelyDeviceId;
//# sourceMappingURL=payload.d.ts.map