"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceHandoffModal = DeviceHandoffModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_camera_1 = require("expo-camera");
const expo_blur_1 = require("expo-blur");
const lucide_react_native_1 = require("lucide-react-native");
const react_native_qrcode_svg_1 = __importDefault(require("react-native-qrcode-svg"));
const payload_1 = require("./payload");
const DEFAULT_LABELS = {
    kicker: 'DEVICE HANDOFF',
    title: 'Transfer Device',
    description: 'Show a QR code on the old device and scan it on the new device to restore the same data.',
    showQr: 'Show this device QR',
    showQrDescription: 'Move this device data to another device.',
    scanQr: 'Scan another device QR',
    scanQrDescription: 'Scan the old device QR and restore data on this device.',
    showInstruction: 'Scan this QR code with the new device.',
    scanInstruction: 'Place the QR code from the old device inside the frame.',
    cameraPermission: 'Camera access is required to scan the QR code.',
    allowCamera: 'Allow Camera',
    invalidQr: 'This is not a valid transfer QR.',
    applying: 'Transferring...',
    applyError: 'Transfer failed. Check your connection and try again.',
};
const DEFAULT_THEME = {
    isDark: false,
    backgroundColor: 'rgba(0,0,0,0.46)',
    cardColor: 'rgba(250,246,241,0.96)',
    textColor: '#4A4035',
    textSecondaryColor: '#8B7355',
    textFaintColor: '#C4B8A8',
    accentColor: '#8B7355',
    borderColor: 'rgba(74,64,53,0.12)',
    mutedColor: 'rgba(74,64,53,0.06)',
    fontFamily: undefined,
    mediumFontFamily: undefined,
    lightFontFamily: undefined,
    boldFontFamily: undefined,
};
function DeviceHandoffModal({ visible, value, deviceId, onClose, onApplyValue, onApplyDeviceId, labels: labelsProp, theme: themeProp, payloadType, payloadVersion, qrSize = 210, validateValue, validateDeviceId, availableModes = ['show', 'scan'], }) {
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const theme = { ...DEFAULT_THEME, ...themeProp };
    const [mode, setMode] = (0, react_1.useState)('menu');
    const [permission, requestPermission] = (0, expo_camera_1.useCameraPermissions)();
    const [scanned, setScanned] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [applying, setApplying] = (0, react_1.useState)(false);
    const currentValue = value ?? deviceId ?? null;
    const applyValue = onApplyValue ?? onApplyDeviceId;
    const resolvedValidateValue = validateValue ?? validateDeviceId;
    const payloadOptions = (0, react_1.useMemo)(() => ({ type: payloadType, version: payloadVersion, validateValue: resolvedValidateValue }), [payloadType, payloadVersion, resolvedValidateValue]);
    const qrValue = (0, react_1.useMemo)(() => (currentValue ? (0, payload_1.createDeviceHandoffPayload)(currentValue, payloadOptions) : ''), [currentValue, payloadOptions]);
    const allowedModes = (0, react_1.useMemo)(() => availableModes.filter((mode) => mode === 'show' || mode === 'scan'), [availableModes]);
    const defaultMode = allowedModes[0] ?? 'show';
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        setMode(allowedModes.length > 1 ? 'menu' : defaultMode);
        setScanned(false);
        setError(null);
        setApplying(false);
    }, [allowedModes.length, defaultMode, visible]);
    (0, react_1.useEffect)(() => {
        if (visible && mode === 'scan' && permission && !permission.granted) {
            requestPermission();
        }
    }, [mode, permission, requestPermission, visible]);
    const handleBarcodeScanned = async ({ data }) => {
        if (scanned || applying)
            return;
        setScanned(true);
        setError(null);
        const nextDeviceId = (0, payload_1.parseDeviceHandoffPayload)(data, payloadOptions);
        if (!nextDeviceId) {
            setError(labels.invalidQr);
            setScanned(false);
            return;
        }
        try {
            setApplying(true);
            if (!applyValue) {
                throw new Error('DeviceHandoffModal requires onApplyValue or onApplyDeviceId.');
            }
            await applyValue(nextDeviceId);
            onClose();
        }
        catch {
            setError(labels.applyError);
            setScanned(false);
        }
        finally {
            setApplying(false);
        }
    };
    const scannerReady = mode === 'scan' && permission?.granted;
    const regularFont = fontStyle(theme.fontFamily);
    const lightFont = fontStyle(theme.lightFontFamily ?? theme.fontFamily);
    const mediumFont = fontStyle(theme.mediumFontFamily ?? theme.fontFamily);
    const boldFont = fontStyle(theme.boldFontFamily ?? theme.mediumFontFamily ?? theme.fontFamily);
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: visible, transparent: true, animationType: "fade", statusBarTranslucent: true, onRequestClose: onClose, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.backdrop, { backgroundColor: theme.backgroundColor }], children: [scannerReady ? ((0, jsx_runtime_1.jsx)(expo_camera_1.CameraView, { style: react_native_1.StyleSheet.absoluteFill, facing: "back", onBarcodeScanned: handleBarcodeScanned, barcodeScannerSettings: { barcodeTypes: ['qr'] } })) : ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { style: react_native_1.StyleSheet.absoluteFill, onPress: onClose })), scannerReady && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.scanShade, pointerEvents: "none" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.card, mode === 'scan' && styles.scanCard, { backgroundColor: theme.cardColor, borderColor: theme.borderColor }], children: [(0, jsx_runtime_1.jsx)(expo_blur_1.BlurView, { intensity: theme.isDark ? 28 : 20, tint: theme.isDark ? 'dark' : 'light', style: react_native_1.StyleSheet.absoluteFill }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.accentLine, { backgroundColor: theme.accentColor }] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.header, children: [mode !== 'menu' ? ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: () => {
                                        setMode('menu');
                                        setScanned(false);
                                        setError(null);
                                    }, style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.ArrowLeft, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })) : ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Smartphone, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.headerCopy, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.kicker, { color: theme.textFaintColor }, mediumFont], children: labels.kicker }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.title, { color: theme.textColor }, lightFont], children: labels.title })] }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: onClose, style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.X, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })] }), mode === 'menu' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.content, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.description }), allowedModes.includes('show') && ((0, jsx_runtime_1.jsx)(ChoiceButton, { title: labels.showQr, description: labels.showQrDescription, icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.QrCode, { size: 20, color: theme.cardColor, strokeWidth: 1.8 }), iconColor: theme.textColor, theme: theme, regularFont: regularFont, mediumFont: mediumFont, onPress: () => setMode('show') })), allowedModes.includes('scan') && ((0, jsx_runtime_1.jsx)(ChoiceButton, { title: labels.scanQr, description: labels.scanQrDescription, icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.ScanLine, { size: 20, color: "#FFFFFF", strokeWidth: 1.8 }), iconColor: theme.accentColor, theme: theme, regularFont: regularFont, mediumFont: mediumFont, onPress: () => setMode('scan') }))] })), mode === 'show' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.content, styles.centerContent], children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.showInstruction }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.qrShell, children: !!qrValue && (0, jsx_runtime_1.jsx)(react_native_qrcode_svg_1.default, { value: qrValue, size: qrSize, backgroundColor: "#FFFFFF", color: "#000000" }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.deviceId, { color: theme.textFaintColor }], numberOfLines: 1, children: currentValue })] })), mode === 'scan' && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.content, styles.centerContent], children: !permission?.granted ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.cameraPermission }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: requestPermission, style: ({ pressed }) => [styles.primaryButton, { backgroundColor: theme.textColor, opacity: pressed ? 0.72 : 1 }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.primaryButtonText, { color: theme.cardColor }, boldFont], children: labels.allowCamera }) })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.scanFrame }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.scanHint, regularFont], children: applying ? labels.applying : labels.scanInstruction }), !!error && (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.errorText, mediumFont], children: error })] })) }))] })] }) }));
}
function ChoiceButton({ title, description, icon, iconColor, theme, regularFont, mediumFont, onPress, }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { onPress: onPress, style: ({ pressed }) => [
            styles.choice,
            { backgroundColor: theme.mutedColor, borderColor: theme.borderColor, opacity: pressed ? 0.7 : 1 },
        ], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.choiceIcon, { backgroundColor: iconColor }], children: icon }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.choiceCopy, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.choiceTitle, { color: theme.textColor }, mediumFont], children: title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.choiceText, { color: theme.textSecondaryColor }, regularFont], children: description })] })] }));
}
function fontStyle(fontFamily) {
    return fontFamily ? { fontFamily } : {};
}
const styles = react_native_1.StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    scanShade: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.28)',
    },
    card: {
        overflow: 'hidden',
        borderRadius: 32,
        borderWidth: react_native_1.StyleSheet.hairlineWidth,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    scanCard: {
        minHeight: 420,
    },
    accentLine: {
        height: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCopy: {
        flex: 1,
    },
    kicker: {
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 21,
        fontWeight: '300',
        letterSpacing: 1.6,
        marginTop: 2,
    },
    content: {
        padding: 16,
        gap: 12,
    },
    centerContent: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    description: {
        fontSize: 15,
        fontWeight: '400',
        letterSpacing: 0.3,
        lineHeight: 23,
        textAlign: 'center',
    },
    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: react_native_1.StyleSheet.hairlineWidth,
        borderRadius: 24,
        padding: 16,
        gap: 12,
    },
    choiceIcon: {
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceCopy: {
        flex: 1,
    },
    choiceTitle: {
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.4,
    },
    choiceText: {
        fontSize: 12,
        fontWeight: '400',
        letterSpacing: 0.5,
        lineHeight: 18,
        marginTop: 4,
    },
    qrShell: {
        padding: 16,
        borderRadius: 24,
        marginTop: 8,
        backgroundColor: '#FFFFFF',
    },
    deviceId: {
        fontFamily: 'monospace',
        fontSize: 10,
        maxWidth: 240,
    },
    primaryButton: {
        minHeight: 48,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 12,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    scanFrame: {
        width: 230,
        height: 230,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        marginTop: 16,
    },
    scanHint: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '400',
        letterSpacing: 0.3,
        marginTop: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    errorText: {
        color: '#FFFFFF',
        backgroundColor: 'rgba(190,52,52,0.82)',
        overflow: 'hidden',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 8,
    },
});
//# sourceMappingURL=DeviceHandoffModal.js.map