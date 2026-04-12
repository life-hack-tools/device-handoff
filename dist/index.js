"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreRecords = exports.parseDeviceHandoffPayload = exports.isLikelyDeviceId = exports.createDeviceHandoffPayload = exports.DEFAULT_HANDOFF_VERSION = exports.DEFAULT_HANDOFF_TYPE = exports.DeviceHandoffModal = void 0;
var DeviceHandoffModal_1 = require("./DeviceHandoffModal");
Object.defineProperty(exports, "DeviceHandoffModal", { enumerable: true, get: function () { return DeviceHandoffModal_1.DeviceHandoffModal; } });
var payload_1 = require("./payload");
Object.defineProperty(exports, "DEFAULT_HANDOFF_TYPE", { enumerable: true, get: function () { return payload_1.DEFAULT_HANDOFF_TYPE; } });
Object.defineProperty(exports, "DEFAULT_HANDOFF_VERSION", { enumerable: true, get: function () { return payload_1.DEFAULT_HANDOFF_VERSION; } });
Object.defineProperty(exports, "createDeviceHandoffPayload", { enumerable: true, get: function () { return payload_1.createDeviceHandoffPayload; } });
Object.defineProperty(exports, "isLikelyDeviceId", { enumerable: true, get: function () { return payload_1.isLikelyDeviceId; } });
Object.defineProperty(exports, "parseDeviceHandoffPayload", { enumerable: true, get: function () { return payload_1.parseDeviceHandoffPayload; } });
var restore_1 = require("./restore");
Object.defineProperty(exports, "restoreRecords", { enumerable: true, get: function () { return restore_1.restoreRecords; } });
//# sourceMappingURL=index.js.map