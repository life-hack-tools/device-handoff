export const DEFAULT_HANDOFF_TYPE = 'life-hack-tools-device-handoff';
export const DEFAULT_HANDOFF_VERSION = 1;
export function createDeviceHandoffPayload(deviceId, options = {}) {
    return JSON.stringify({
        type: options.type ?? DEFAULT_HANDOFF_TYPE,
        version: options.version ?? DEFAULT_HANDOFF_VERSION,
        deviceId,
    });
}
export function parseDeviceHandoffPayload(value, options = {}) {
    const trimmed = value.trim();
    if (isLikelyDeviceId(trimmed)) {
        return trimmed;
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.type === (options.type ?? DEFAULT_HANDOFF_TYPE)
            && parsed.version === (options.version ?? DEFAULT_HANDOFF_VERSION)
            && typeof parsed.deviceId === 'string'
            && isLikelyDeviceId(parsed.deviceId)) {
            return parsed.deviceId;
        }
    }
    catch {
        return null;
    }
    return null;
}
export function isLikelyDeviceId(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
//# sourceMappingURL=payload.js.map