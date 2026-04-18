export const DEFAULT_HANDOFF_TYPE = 'life-hack-tools-device-handoff';
export const DEFAULT_HANDOFF_VERSION = 1;

export interface DeviceHandoffPayloadOptions {
  type?: string;
  version?: number;
  validateValue?: (value: string) => boolean;
  validateDeviceId?: (value: string) => boolean;
}

interface DeviceHandoffPayload {
  type: string;
  version: number;
  deviceId: string;
}

export function createHandoffPayload(
  value: string,
  options: DeviceHandoffPayloadOptions = {},
): string {
  const payload: DeviceHandoffPayload = {
    type: options.type ?? DEFAULT_HANDOFF_TYPE,
    version: options.version ?? DEFAULT_HANDOFF_VERSION,
    deviceId: value,
  };

  return JSON.stringify(payload);
}

export function parseHandoffPayload(
  value: string,
  options: DeviceHandoffPayloadOptions = {},
): string | null {
  const trimmed = value.trim();
  const validateValue = options.validateValue ?? options.validateDeviceId ?? isLikelyDeviceId;

  if (validateValue(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<DeviceHandoffPayload>;
    if (
      parsed.type === (options.type ?? DEFAULT_HANDOFF_TYPE)
      && parsed.version === (options.version ?? DEFAULT_HANDOFF_VERSION)
      && typeof parsed.deviceId === 'string'
      && validateValue(parsed.deviceId)
    ) {
      return parsed.deviceId;
    }
  } catch {
    return null;
  }

  return null;
}

export function isLikelyDeviceId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const createDeviceHandoffPayload = createHandoffPayload;
export const parseDeviceHandoffPayload = parseHandoffPayload;
export const isLikelyHandoffValue = isLikelyDeviceId;
