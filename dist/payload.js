"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLikelyHandoffValue = exports.parseDeviceHandoffPayload = exports.createDeviceHandoffPayload = exports.DEFAULT_HANDOFF_VERSION = exports.DEFAULT_HANDOFF_TYPE = void 0;
exports.createHandoffPayload = createHandoffPayload;
exports.parseHandoffPayload = parseHandoffPayload;
exports.isLikelyDeviceId = isLikelyDeviceId;
exports.DEFAULT_HANDOFF_TYPE = 'life-hack-tools-device-handoff';
exports.DEFAULT_HANDOFF_VERSION = 1;
function createHandoffPayload(value, options = {}) {
    const payload = {
        type: options.type ?? exports.DEFAULT_HANDOFF_TYPE,
        version: options.version ?? exports.DEFAULT_HANDOFF_VERSION,
        deviceId: value,
    };
    return JSON.stringify(payload);
}
function parseHandoffPayload(value, options = {}) {
    const trimmed = value.trim();
    const validateValue = options.validateValue ?? options.validateDeviceId ?? isLikelyDeviceId;
    if (validateValue(trimmed)) {
        return trimmed;
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.type === (options.type ?? exports.DEFAULT_HANDOFF_TYPE)
            && parsed.version === (options.version ?? exports.DEFAULT_HANDOFF_VERSION)
            && typeof parsed.deviceId === 'string'
            && validateValue(parsed.deviceId)) {
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
exports.createDeviceHandoffPayload = createHandoffPayload;
exports.parseDeviceHandoffPayload = parseHandoffPayload;
exports.isLikelyHandoffValue = isLikelyDeviceId;
//# sourceMappingURL=payload.js.map