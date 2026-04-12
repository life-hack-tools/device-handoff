export declare const DEFAULT_HANDOFF_TYPE = "life-hack-tools-device-handoff";
export declare const DEFAULT_HANDOFF_VERSION = 1;
export interface DeviceHandoffPayloadOptions {
    type?: string;
    version?: number;
}
export declare function createDeviceHandoffPayload(deviceId: string, options?: DeviceHandoffPayloadOptions): string;
export declare function parseDeviceHandoffPayload(value: string, options?: DeviceHandoffPayloadOptions): string | null;
export declare function isLikelyDeviceId(value: string): boolean;
//# sourceMappingURL=payload.d.ts.map