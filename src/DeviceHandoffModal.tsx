import React, { useEffect, useMemo, useState } from 'react';
import type { TextStyle } from 'react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { ArrowLeft, QrCode, ScanLine, Smartphone, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { createDeviceHandoffPayload, parseDeviceHandoffPayload } from './payload';

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

const DEFAULT_LABELS: DeviceHandoffLabels = {
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

const DEFAULT_THEME: Required<DeviceHandoffTheme> = {
  isDark: false,
  backgroundColor: 'rgba(0,0,0,0.46)',
  cardColor: 'rgba(250,246,241,0.96)',
  textColor: '#4A4035',
  textSecondaryColor: '#8B7355',
  textFaintColor: '#C4B8A8',
  accentColor: '#8B7355',
  borderColor: 'rgba(74,64,53,0.12)',
  mutedColor: 'rgba(74,64,53,0.06)',
  fontFamily: undefined as unknown as string,
  mediumFontFamily: undefined as unknown as string,
  lightFontFamily: undefined as unknown as string,
  boldFontFamily: undefined as unknown as string,
};

export function DeviceHandoffModal({
  visible,
  value,
  deviceId,
  onClose,
  onApplyValue,
  onApplyDeviceId,
  labels: labelsProp,
  theme: themeProp,
  payloadType,
  payloadVersion,
  qrSize = 210,
  validateValue,
  validateDeviceId,
  availableModes = ['show', 'scan'],
}: DeviceHandoffModalProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const theme = { ...DEFAULT_THEME, ...themeProp };
  const [mode, setMode] = useState<HandoffMode>('menu');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const currentValue = value ?? deviceId ?? null;
  const applyValue = onApplyValue ?? onApplyDeviceId;
  const resolvedValidateValue = validateValue ?? validateDeviceId;
  const payloadOptions = useMemo(
    () => ({ type: payloadType, version: payloadVersion, validateValue: resolvedValidateValue }),
    [payloadType, payloadVersion, resolvedValidateValue],
  );
  const qrValue = useMemo(
    () => (currentValue ? createDeviceHandoffPayload(currentValue, payloadOptions) : ''),
    [currentValue, payloadOptions],
  );
  const allowedModes = useMemo(
    () => availableModes.filter((mode): mode is HandoffMode => mode === 'show' || mode === 'scan'),
    [availableModes],
  );
  const defaultMode = allowedModes[0] ?? 'show';

  useEffect(() => {
    if (!visible) return;
    setMode(allowedModes.length > 1 ? 'menu' : defaultMode);
    setScanned(false);
    setError(null);
    setApplying(false);
  }, [allowedModes.length, defaultMode, visible]);

  useEffect(() => {
    if (visible && mode === 'scan' && permission && !permission.granted) {
      requestPermission();
    }
  }, [mode, permission, requestPermission, visible]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || applying) return;

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
      if (!applyValue) {
        throw new Error('DeviceHandoffModal requires onApplyValue or onApplyDeviceId.');
      }
      await applyValue(nextDeviceId);
      onClose();
    } catch {
      setError(labels.applyError);
      setScanned(false);
    } finally {
      setApplying(false);
    }
  };

  const scannerReady = mode === 'scan' && permission?.granted;
  const regularFont = fontStyle(theme.fontFamily);
  const lightFont = fontStyle(theme.lightFontFamily ?? theme.fontFamily);
  const mediumFont = fontStyle(theme.mediumFontFamily ?? theme.fontFamily);
  const boldFont = fontStyle(theme.boldFontFamily ?? theme.mediumFontFamily ?? theme.fontFamily);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.backgroundColor }]}>
        {scannerReady ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        ) : (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        )}

        {scannerReady && <View style={styles.scanShade} pointerEvents="none" />}

        <View style={[styles.card, mode === 'scan' && styles.scanCard, { backgroundColor: theme.cardColor, borderColor: theme.borderColor }]}>
          <BlurView intensity={theme.isDark ? 28 : 20} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.accentLine, { backgroundColor: theme.accentColor }]} />

          <View style={styles.header}>
            {mode !== 'menu' ? (
              <Pressable
                onPress={() => {
                  setMode('menu');
                  setScanned(false);
                  setError(null);
                }}
                style={[styles.iconButton, { backgroundColor: theme.mutedColor }]}
              >
                <ArrowLeft size={18} color={theme.textColor} strokeWidth={1.7} />
              </Pressable>
            ) : (
              <View style={[styles.iconButton, { backgroundColor: theme.mutedColor }]}> 
                <Smartphone size={18} color={theme.textColor} strokeWidth={1.7} />
              </View>
            )}
            <View style={styles.headerCopy}>
              <Text style={[styles.kicker, { color: theme.textFaintColor }, mediumFont]}>{labels.kicker}</Text>
              <Text style={[styles.title, { color: theme.textColor }, lightFont]}>{labels.title}</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.iconButton, { backgroundColor: theme.mutedColor }]}> 
              <X size={18} color={theme.textColor} strokeWidth={1.7} />
            </Pressable>
          </View>

          {mode === 'menu' && (
            <View style={styles.content}>
              <Text style={[styles.description, { color: theme.textSecondaryColor }, regularFont]}>{labels.description}</Text>
              {allowedModes.includes('show') && (
                <ChoiceButton
                  title={labels.showQr}
                  description={labels.showQrDescription}
                  icon={<QrCode size={20} color={theme.cardColor} strokeWidth={1.8} />}
                  iconColor={theme.textColor}
                  theme={theme}
                  regularFont={regularFont}
                  mediumFont={mediumFont}
                  onPress={() => setMode('show')}
                />
              )}
              {allowedModes.includes('scan') && (
                <ChoiceButton
                  title={labels.scanQr}
                  description={labels.scanQrDescription}
                  icon={<ScanLine size={20} color="#FFFFFF" strokeWidth={1.8} />}
                  iconColor={theme.accentColor}
                  theme={theme}
                  regularFont={regularFont}
                  mediumFont={mediumFont}
                  onPress={() => setMode('scan')}
                />
              )}
            </View>
          )}

          {mode === 'show' && (
            <View style={[styles.content, styles.centerContent]}>
              <Text style={[styles.description, { color: theme.textSecondaryColor }, regularFont]}>{labels.showInstruction}</Text>
              <View style={styles.qrShell}>
                {!!qrValue && <QRCode value={qrValue} size={qrSize} backgroundColor="#FFFFFF" color="#000000" />}
              </View>
              <Text style={[styles.deviceId, { color: theme.textFaintColor }]} numberOfLines={1}>{currentValue}</Text>
            </View>
          )}

          {mode === 'scan' && (
            <View style={[styles.content, styles.centerContent]}>
              {!permission?.granted ? (
                <>
                  <Text style={[styles.description, { color: theme.textSecondaryColor }, regularFont]}>{labels.cameraPermission}</Text>
                  <Pressable
                    onPress={requestPermission}
                    style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.textColor, opacity: pressed ? 0.72 : 1 }]}
                  >
                    <Text style={[styles.primaryButtonText, { color: theme.cardColor }, boldFont]}>{labels.allowCamera}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.scanFrame} />
                  <Text style={[styles.scanHint, regularFont]}>{applying ? labels.applying : labels.scanInstruction}</Text>
                  {!!error && <Text style={[styles.errorText, mediumFont]}>{error}</Text>}
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ChoiceButton({
  title,
  description,
  icon,
  iconColor,
  theme,
  regularFont,
  mediumFont,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  theme: Required<DeviceHandoffTheme>;
  regularFont: TextStyle;
  mediumFont: TextStyle;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        { backgroundColor: theme.mutedColor, borderColor: theme.borderColor, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.choiceIcon, { backgroundColor: iconColor }]}>{icon}</View>
      <View style={styles.choiceCopy}>
        <Text style={[styles.choiceTitle, { color: theme.textColor }, mediumFont]}>{title}</Text>
        <Text style={[styles.choiceText, { color: theme.textSecondaryColor }, regularFont]}>{description}</Text>
      </View>
    </Pressable>
  );
}

function fontStyle(fontFamily: string | undefined): TextStyle {
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
