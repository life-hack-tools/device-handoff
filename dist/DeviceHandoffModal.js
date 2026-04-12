import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { ArrowLeft, QrCode, ScanLine, Smartphone, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { createDeviceHandoffPayload, parseDeviceHandoffPayload } from './payload';
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
export function DeviceHandoffModal({ visible, deviceId, onClose, onApplyDeviceId, labels: labelsProp, theme: themeProp, payloadType, payloadVersion, qrSize = 210, }) {
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const theme = { ...DEFAULT_THEME, ...themeProp };
    const [mode, setMode] = useState('menu');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const payloadOptions = useMemo(() => ({ type: payloadType, version: payloadVersion }), [payloadType, payloadVersion]);
    const qrValue = useMemo(() => (deviceId ? createDeviceHandoffPayload(deviceId, payloadOptions) : ''), [deviceId, payloadOptions]);
    useEffect(() => {
        if (!visible)
            return;
        setMode('menu');
        setScanned(false);
        setError(null);
        setApplying(false);
    }, [visible]);
    useEffect(() => {
        if (visible && mode === 'scan' && permission && !permission.granted) {
            requestPermission();
        }
    }, [mode, permission, requestPermission, visible]);
    const handleBarcodeScanned = async ({ data }) => {
        if (scanned || applying)
            return;
        setScanned(true);
        setError(null);
        const nextDeviceId = parseDeviceHandoffPayload(data, payloadOptions);
        if (!nextDeviceId) {
            setError(labels.invalidQr);
            setScanned(false);
            return;
        }
        try {
            setApplying(true);
            await onApplyDeviceId(nextDeviceId);
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
    return (_jsx(Modal, { visible: visible, transparent: true, animationType: "fade", statusBarTranslucent: true, onRequestClose: onClose, children: _jsxs(View, { style: [styles.backdrop, { backgroundColor: theme.backgroundColor }], children: [scannerReady ? (_jsx(CameraView, { style: StyleSheet.absoluteFill, facing: "back", onBarcodeScanned: handleBarcodeScanned, barcodeScannerSettings: { barcodeTypes: ['qr'] } })) : (_jsx(Pressable, { style: StyleSheet.absoluteFill, onPress: onClose })), scannerReady && _jsx(View, { style: styles.scanShade, pointerEvents: "none" }), _jsxs(View, { style: [styles.card, mode === 'scan' && styles.scanCard, { backgroundColor: theme.cardColor, borderColor: theme.borderColor }], children: [_jsx(BlurView, { intensity: theme.isDark ? 28 : 20, tint: theme.isDark ? 'dark' : 'light', style: StyleSheet.absoluteFill }), _jsx(View, { style: [styles.accentLine, { backgroundColor: theme.accentColor }] }), _jsxs(View, { style: styles.header, children: [mode !== 'menu' ? (_jsx(Pressable, { onPress: () => {
                                        setMode('menu');
                                        setScanned(false);
                                        setError(null);
                                    }, style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: _jsx(ArrowLeft, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })) : (_jsx(View, { style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: _jsx(Smartphone, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })), _jsxs(View, { style: styles.headerCopy, children: [_jsx(Text, { style: [styles.kicker, { color: theme.textFaintColor }, mediumFont], children: labels.kicker }), _jsx(Text, { style: [styles.title, { color: theme.textColor }, lightFont], children: labels.title })] }), _jsx(Pressable, { onPress: onClose, style: [styles.iconButton, { backgroundColor: theme.mutedColor }], children: _jsx(X, { size: 18, color: theme.textColor, strokeWidth: 1.7 }) })] }), mode === 'menu' && (_jsxs(View, { style: styles.content, children: [_jsx(Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.description }), _jsx(ChoiceButton, { title: labels.showQr, description: labels.showQrDescription, icon: _jsx(QrCode, { size: 20, color: theme.cardColor, strokeWidth: 1.8 }), iconColor: theme.textColor, theme: theme, regularFont: regularFont, mediumFont: mediumFont, onPress: () => setMode('show') }), _jsx(ChoiceButton, { title: labels.scanQr, description: labels.scanQrDescription, icon: _jsx(ScanLine, { size: 20, color: "#FFFFFF", strokeWidth: 1.8 }), iconColor: theme.accentColor, theme: theme, regularFont: regularFont, mediumFont: mediumFont, onPress: () => setMode('scan') })] })), mode === 'show' && (_jsxs(View, { style: [styles.content, styles.centerContent], children: [_jsx(Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.showInstruction }), _jsx(View, { style: styles.qrShell, children: !!qrValue && _jsx(QRCode, { value: qrValue, size: qrSize, backgroundColor: "#FFFFFF", color: "#000000" }) }), _jsx(Text, { style: [styles.deviceId, { color: theme.textFaintColor }], numberOfLines: 1, children: deviceId })] })), mode === 'scan' && (_jsx(View, { style: [styles.content, styles.centerContent], children: !permission?.granted ? (_jsxs(_Fragment, { children: [_jsx(Text, { style: [styles.description, { color: theme.textSecondaryColor }, regularFont], children: labels.cameraPermission }), _jsx(Pressable, { onPress: requestPermission, style: ({ pressed }) => [styles.primaryButton, { backgroundColor: theme.textColor, opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { style: [styles.primaryButtonText, { color: theme.cardColor }, boldFont], children: labels.allowCamera }) })] })) : (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.scanFrame }), _jsx(Text, { style: [styles.scanHint, regularFont], children: applying ? labels.applying : labels.scanInstruction }), !!error && _jsx(Text, { style: [styles.errorText, mediumFont], children: error })] })) }))] })] }) }));
}
function ChoiceButton({ title, description, icon, iconColor, theme, regularFont, mediumFont, onPress, }) {
    return (_jsxs(Pressable, { onPress: onPress, style: ({ pressed }) => [
            styles.choice,
            { backgroundColor: theme.mutedColor, borderColor: theme.borderColor, opacity: pressed ? 0.7 : 1 },
        ], children: [_jsx(View, { style: [styles.choiceIcon, { backgroundColor: iconColor }], children: icon }), _jsxs(View, { style: styles.choiceCopy, children: [_jsx(Text, { style: [styles.choiceTitle, { color: theme.textColor }, mediumFont], children: title }), _jsx(Text, { style: [styles.choiceText, { color: theme.textSecondaryColor }, regularFont], children: description })] })] }));
}
function fontStyle(fontFamily) {
    return fontFamily ? { fontFamily } : {};
}
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    scanShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.28)',
    },
    card: {
        overflow: 'hidden',
        borderRadius: 32,
        borderWidth: StyleSheet.hairlineWidth,
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
        borderWidth: StyleSheet.hairlineWidth,
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