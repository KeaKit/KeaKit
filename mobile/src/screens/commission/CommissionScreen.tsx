import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getCommissionConfig, updateCommissionConfig } from '../../services/PlatformConfigService';

type CommissionNav = NativeStackNavigationProp<RootStackParamList, 'Commission'>;

const KC = {
  cream:     '#fcfff5',
  blue:      '#2d6e91',
  blueDark:  '#1e526e',
  gray:      '#595959',
  grayLight: '#f0f0f0',
  white:     '#FFFFFF',
  mint:      '#c3f1d1',
  mintDark:  '#4caf7d',
  error:     '#e74c3c',
  errorBg:   '#fdf0f0',
  border:    '#dde3ea',
};

// ─── Animated fade-in ─────────────────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

const toPercent = (decimal: number): string =>
  (decimal * 100).toFixed(2).replace(/\.?0+$/, '');

const normalize = (value: string) => value.replace(',', '.');

const toDecimal = (percent: string): number =>
  parseFloat(normalize(percent)) / 100;

const CommissionScreen: React.FC = () => {
  const navigation = useNavigation<CommissionNav>();
  const { user }   = useAuth();

  const [currentDecimal, setCurrentDecimal] = useState<number | null>(null);
  const [inputValue,     setInputValue]     = useState('');
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [inputError,     setInputError]     = useState('');
  const [saveSuccess,    setSaveSuccess]    = useState(false);

  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.token) return;
        const config = await getCommissionConfig(user.token);
        setCurrentDecimal(config.commissionRate);
        setInputValue(toPercent(config.commissionRate));
      } catch {
        Alert.alert('Error', 'No se pudo cargar la comisión actual.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showSuccess = () => {
    setSaveSuccess(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(successOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setSaveSuccess(false));
  };

  const validate = (): boolean => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setInputError('Introduce un número válido');
      return false;
    }
    if (num < 0 || num > 100) {
      setInputError('El porcentaje debe estar entre 0 y 100');
      return false;
    }
    setInputError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!user?.token) return;
    setSaving(true);
    try {
      const decimal = toDecimal(inputValue);
      const updated = await updateCommissionConfig(user.token, decimal);
      setCurrentDecimal(updated.commissionRate);
      setInputValue(toPercent(updated.commissionRate));
      showSuccess();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la comisión.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanged =
    currentDecimal !== null &&
    inputValue !== '' &&
    !isNaN(parseFloat(inputValue)) &&
    Math.abs(toDecimal(inputValue) - currentDecimal) > 0.0001;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={KC.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comisión de plataforma</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>

        <FadeIn delay={60}>
          <LinearGradient
            colors={[KC.blue, KC.blueDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerIconWrap}>
              <Ionicons name="cash" size={32} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Comisión actual</Text>
              {loading ? (
                <ActivityIndicator color={KC.white} style={{ marginTop: 6 }} />
              ) : (
                <Text style={styles.bannerValue}>
                  {currentDecimal !== null ? `${toPercent(currentDecimal)}%` : '—'}
                </Text>
              )}
              <Text style={styles.bannerSub}>Por cada artículo alquilado</Text>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* ── Card edición ─────────────────────────────────────────────── */}
        <FadeIn delay={160}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Modificar comisión</Text>
            <Text style={styles.cardDesc}>
              Introduce el nuevo porcentaje. El valor debe estar entre 0% y 100%.
            </Text>

            {/* Input + símbolo % */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, !!inputError && styles.inputError]}
                value={inputValue}
                onChangeText={(t) => { setInputValue(t.replace(',', '.')); setInputError(''); }}
                keyboardType="decimal-pad"
                placeholder="Ej: 20"
                placeholderTextColor="#aaa"
                editable={!loading && !saving}
              />
              <View style={styles.percentBadge}>
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>

            {!!inputError && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color={KC.error} />
                <Text style={styles.errorText}>{inputError}</Text>
              </View>
            )}

            <Text style={styles.hint}>Mínimo: 0% · Máximo: 100%</Text>

            {/* Botón guardar */}
            <TouchableOpacity
              style={[styles.saveBtn, (!hasChanged || saving || loading) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!hasChanged || saving || loading}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={KC.white} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color={KC.white} style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Guardar cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </FadeIn>

        {saveSuccess && (
          <Animated.View style={[styles.toast, { opacity: successOpacity }]}>
            <Ionicons name="checkmark-circle" size={18} color={KC.mintDark} />
            <Text style={styles.toastText}>Comisión actualizada correctamente</Text>
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: KC.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: KC.cream,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: KC.blue,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  // Banner
  banner: {
    borderRadius: 18,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bannerValue: {
    fontSize: 36,
    fontWeight: '800',
    color: KC.white,
    letterSpacing: -1,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: KC.white,
    borderRadius: 18,
    padding: 22,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: KC.blue,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: KC.gray,
    lineHeight: 19,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: KC.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    color: KC.blue,
    backgroundColor: '#f8fbff',
  },
  inputError: {
    borderColor: KC.error,
    backgroundColor: KC.errorBg,
  },
  percentBadge: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: KC.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentSymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: KC.gray,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    color: KC.error,
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: KC.blue,
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: KC.white,
  },

  // Toast
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: KC.mint,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: KC.mintDark,
  },
});

export default CommissionScreen;