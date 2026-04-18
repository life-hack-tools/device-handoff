export interface DeviceHandoffLabels {
    kicker: string;
    title: string;
    description: string;
    showQr: string;
    showQrDescription: string;
    scanQr: string;
    scanQrDescription: string;
    showInstruction: string;
    scanInstruction: string;
    cameraPermission: string;
    allowCamera: string;
    invalidQr: string;
    applying: string;
    applyError: string;
}
export interface DeviceHandoffTheme {
    isDark?: boolean;
    backgroundColor?: string;
    cardColor?: string;
    textColor?: string;
    textSecondaryColor?: string;
    textFaintColor?: string;
    accentColor?: string;
    borderColor?: string;
    mutedColor?: string;
    fontFamily?: string;
    mediumFontFamily?: string;
    lightFontFamily?: string;
    boldFontFamily?: string;
}
export interface DeviceHandoffModalProps {
    visible: boolean;
    value?: string | null;
    deviceId?: string | null;
    onClose: () => void;
    onApplyValue?: (value: string) => Promise<void>;
    onApplyDeviceId?: (deviceId: string) => Promise<void>;
    labels?: Partial<DeviceHandoffLabels>;
    theme?: DeviceHandoffTheme;
    payloadType?: string;
    payloadVersion?: number;
    qrSize?: number;
    validateValue?: (value: string) => boolean;
    validateDeviceId?: (deviceId: string) => boolean;
    availableModes?: HandoffMode[];
}
type HandoffMode = 'menu' | 'show' | 'scan';
export declare function DeviceHandoffModal({ visible, value, deviceId, onClose, onApplyValue, onApplyDeviceId, labels: labelsProp, theme: themeProp, payloadType, payloadVersion, qrSize, validateValue, validateDeviceId, availableModes, }: DeviceHandoffModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DeviceHandoffModal.d.ts.map