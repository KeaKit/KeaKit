import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createPromoCode, updatePromoCode } from '../../services/promoCodeService';

type PromoCodeFormNav = NativeStackNavigationProp<RootStackParamList, 'PromoCodeForm'>;
type PromoCodeFormRoute = RouteProp<RootStackParamList, 'PromoCodeForm'>;

const KC = {
  cream: '#fcfff5', blue: '#2d6e91', blueDark: '#1e526e',
  gray: '#595959', grayLight: '#f0f0f0', white: '#FFFFFF',
  mint: '#c3f1d1', mintDark: '#4caf7d', error: '#e74c3c',
  errorBg: '#fdf0f0', border: '#dde3ea',
};

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

const PromoCodeFormScreen: React.FC = () => {
  const navigation = useNavigation<PromoCodeFormNav>();
  const route = useRoute<PromoCodeFormRoute>();
  const { user } = useAuth();
  const { promoCode, mode } = route.params;
  const isEdit = mode === 'edit';

  const [code,           setCode]           = useState(promoCode?.code ?? '');
  const [discountStr,    setDiscountStr]     = useState(promoCode ? String((promoCode.discountRate * 100).toFixed(0)) : '');
  const [active,         setActive]         = useState(promoCode?.active ?? true);
  const [singleUse,      setSingleUse]      = useState(promoCode?.singleUse ?? false);
  const [pilotUserOnly,  setPilotUserOnly]  = useState(promoCode?.pilotUserOnly ?? false);
  const [pilotEmails,    setPilotEmails]    = useState<string[]>(promoCode?.pilotEmails ?? []);
  const [newEmail,       setNewEmail]       = useState('');
  const [saving,         setSaving]         = useState(false);
  const [codeError,      setCodeError]      = useState('');
  const [discountError,  setDiscountError]  = useState('');
  const [emailError, setEmailError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (!code.trim()) {
      setCodeError('El código es obligatorio');
      valid = false;
    } else setCodeError('');

    const num = parseFloat(discountStr);
    if (isNaN(num) || num < 0 || num > 100) {
      setDiscountError('El descuento debe estar entre 0 y 100');
        valid = false;
      } else if (!Number.isInteger(num) || discountStr.includes(',') || discountStr.includes('.')) {
        setDiscountError('El descuento debe ser un número entero (sin decimales)');
        valid = false;
      } else setDiscountError('');
      return valid;
    };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmed)) {
        setEmailError('Introduce un email con formato válido (usuario@dominio.com)');
        return;
    }
    if (pilotEmails.includes(trimmed)) {
        setEmailError('Este email ya está en la lista');
        return;
    }
    setEmailError('');
    setPilotEmails(prev => [...prev, trimmed]);
    setNewEmail('');
    };

  const handleRemoveEmail = (email: string) => {
    setPilotEmails(prev => prev.filter(e => e !== email));
  };

  const handleSave = async () => {
    if (!validate() || !user?.token) return;
    setSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountRate: parseFloat(discountStr) / 100,
        active,
        singleUse,
        pilotUserOnly,
        pilotEmails,
      };
      if (isEdit && promoCode?.id) {
        await updatePromoCode(user.token, promoCode.id, payload);
      } else {
        await createPromoCode(user.token, payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar el código.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={KC.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Editar código' : 'Nuevo código'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Código */}
        <FadeIn delay={60}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Código promocional</Text>
            <TextInput
              style={[styles.input, !!codeError && styles.inputError]}
              value={code}
              onChangeText={t => { setCode(t.toUpperCase()); setCodeError(''); }}
              placeholder="Ej: BIENVENIDA20"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              editable={!saving}
            />
            {!!codeError && <Text style={styles.errorText}>{codeError}</Text>}

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Porcentaje de descuento</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, !!discountError && styles.inputError]}
                value={discountStr}
                onChangeText={t => { setDiscountStr(t); setDiscountError(''); }}
                placeholder="Ej: 15"
                placeholderTextColor="#aaa"
                keyboardType="decimal-pad"
                editable={!saving}
              />
              <View style={styles.percentBadge}>
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>
            {!!discountError && <Text style={styles.errorText}>{discountError}</Text>}
          </View>
        </FadeIn>

        {/* Opciones */}
        <FadeIn delay={120}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Opciones</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Activo</Text>
                <Text style={styles.toggleDesc}>El código puede ser utilizado</Text>
              </View>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: KC.border, true: KC.mint }}
                thumbColor={active ? KC.mintDark : KC.grayLight}
              />
            </View>

            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: KC.border, paddingTop: 14 }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Un solo uso global</Text>
                <Text style={styles.toggleDesc}>Solo puede usarse una vez en toda la plataforma</Text>
              </View>
              <Switch
                value={singleUse}
                onValueChange={v => { setSingleUse(v); if (v) setPilotUserOnly(false); }}
                trackColor={{ false: KC.border, true: KC.mint }}
                thumbColor={singleUse ? KC.mintDark : KC.grayLight}
              />
            </View>

            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: KC.border, paddingTop: 14 }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Solo usuarios piloto</Text>
                <Text style={styles.toggleDesc}>Restricción por email, uso único por persona</Text>
              </View>
              <Switch
                value={pilotUserOnly}
                onValueChange={v => { setPilotUserOnly(v); if (v) setSingleUse(false); }}
                trackColor={{ false: KC.border, true: KC.mint }}
                thumbColor={pilotUserOnly ? KC.mintDark : KC.grayLight}
              />
            </View>
          </View>
        </FadeIn>

        {/* Lista de emails piloto */}
        {pilotUserOnly && (
          <FadeIn delay={180}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Emails de usuarios piloto</Text>
              <Text style={styles.cardDesc}>
                Solo los emails de esta lista podrán usar este código, y solo una vez cada uno.
              </Text>

              {/* Input añadir email */}
              <View style={styles.emailInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }, !!emailError && styles.inputError]}
                  value={newEmail}
                  onChangeText={t => { setNewEmail(t); setEmailError(''); }}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                  onSubmitEditing={handleAddEmail}
                />
                <TouchableOpacity style={styles.addEmailBtn} onPress={handleAddEmail}>
                  <Ionicons name="add" size={22} color={KC.white} />
                </TouchableOpacity>
              </View>
              {!!emailError && (
                <View style={styles.errorRow}>
                    <Text style={styles.errorText}>{emailError}</Text>
                </View>
                )}

              {/* Lista de emails */}
              {pilotEmails.length === 0 ? (
                <Text style={styles.emptyEmails}>Aún no hay emails en la lista</Text>
              ) : (
                pilotEmails.map(email => (
                  <View key={email} style={styles.emailRow}>
                    <Ionicons name="person-circle-outline" size={18} color={KC.blue} />
                    <Text style={styles.emailText}>{email}</Text>
                    <TouchableOpacity onPress={() => handleRemoveEmail(email)} style={{ marginLeft: 'auto' }}>
                      <Ionicons name="close-circle" size={20} color={KC.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </FadeIn>
        )}

        {/* Botón guardar */}
        <FadeIn delay={240}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={KC.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color={KC.white} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>{isEdit ? 'Guardar cambios' : 'Crear código'}</Text>
              </>
            )}
          </TouchableOpacity>
        </FadeIn>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KC.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: KC.cream,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: KC.blue, letterSpacing: -0.3 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: KC.white, borderRadius: 18, padding: 22, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: KC.blue },
  cardDesc: { fontSize: 13, color: KC.gray, lineHeight: 19 },
  input: {
    height: 50, borderWidth: 1.5, borderColor: KC.border, borderRadius: 12,
    paddingHorizontal: 16, fontSize: 16, color: KC.blue, backgroundColor: '#f8fbff',
  },
  inputError: { borderColor: KC.error, backgroundColor: KC.errorBg },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  percentBadge: {
    width: 48, height: 50, borderRadius: 12, backgroundColor: KC.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  percentSymbol: { fontSize: 20, fontWeight: '700', color: KC.gray },
  errorText: { fontSize: 13, color: KC.error },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleInfo: { flex: 1, paddingRight: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: KC.blueDark },
  toggleDesc: { fontSize: 12, color: KC.gray, marginTop: 2 },
  emailInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addEmailBtn: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: KC.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  emailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0f7ff', borderRadius: 10, padding: 10,
  },
  emailText: { fontSize: 14, color: KC.blueDark, flex: 1 },
  emptyEmails: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 12 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16, backgroundColor: KC.blue,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: KC.white },
});

export default PromoCodeFormScreen;