# @life-hack-tools/device-handoff

React Native / Expo QR device handoff UI and payload helpers.

## Features

- Show a QR code for the current device identity
- Scan a QR code with `expo-camera`
- Validate structured handoff payloads
- Keep app-specific identity storage and restore logic outside the package

## Usage

```tsx
import { DeviceHandoffModal } from '@life-hack-tools/device-handoff';

<DeviceHandoffModal
  visible={visible}
  deviceId={deviceId}
  payloadType="worddiary-handoff"
  labels={labels}
  onClose={() => setVisible(false)}
  onApplyDeviceId={async (nextDeviceId) => {
    await saveDeviceId(nextDeviceId);
    await restoreRemoteData();
  }}
/>
```
