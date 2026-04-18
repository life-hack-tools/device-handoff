# @life-hack-tools/device-handoff

React Native / Expo QR handoff UI and payload helpers.

## Features

- Show a QR code for the current app-owned identifier
- Scan a QR code with `expo-camera`
- Validate structured handoff payloads
- Keep app-specific storage and restore logic outside the package

## Usage

```tsx
import { DeviceHandoffModal } from '@life-hack-tools/device-handoff';

<DeviceHandoffModal
  visible={visible}
  value={userId}
  payloadType="my-app-handoff"
  labels={labels}
  onClose={() => setVisible(false)}
  validateValue={(value) => value.length > 0}
  onApplyValue={async (nextValue) => {
    await saveUserId(nextValue);
    await restoreRemoteData(nextValue);
  }}
/>
```

`deviceId`, `onApplyDeviceId`, and `validateDeviceId` remain available as backward-compatible aliases.

## Data Restore

Use `restoreRecords()` when the scanned handoff key unlocks remote data and you need to merge that data into local storage.
