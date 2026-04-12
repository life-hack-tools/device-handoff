"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_HANDOFF_VERSION = exports.DEFAULT_HANDOFF_TYPE = void 0;
exports.createDeviceHandoffPayload = createDeviceHandoffPayload;
exports.parseDeviceHandoffPayload = parseDeviceHandoffPayload;
exports.isLikelyDeviceId = isLikelyDeviceId;
exports.DEFAULT_HANDOFF_TYPE = 'life-hack-tools-device-handoff';
exports.DEFAULT_HANDOFF_VERSION = 1;
function createDeviceHandoffPayload(deviceId, options = {}) {
    const payload = {
        type: options.type ?? exports.DEFAULT_HANDOFF_TYPE,
        version: options.version ?? exports.DEFAULT_HANDOFF_VERSION,
        deviceId,
    };
    return JSON.stringify(payload);
}
function parseDeviceHandoffPayload(value, options = {}) {
    const trimmed = value.trim();
    if (isLikelyDeviceId(trimmed)) {
        return trimmed;
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.type === (options.type ?? exports.DEFAULT_HANDOFF_TYPE)
            && parsed.version === (options.version ?? exports.DEFAULT_HANDOFF_VERSION)
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
function isLikelyDeviceId(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
//# sourceMappingURL=payload.js.map