import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';

type RegisterNav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  password?: string;
  confirm?: string;
  general?: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al registrarse.' };
  const message = err.message.toLowerCase();
  if (message.includes('email already'))
    return { email: 'Este correo ya está registrado.' };
  return { general: err.message || 'Error al registrarse.' };
};

type FieldConfig = {
  key: keyof Omit<FieldErrors, 'general'>;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  secure?: boolean;
  fullWidth?: boolean;
  icon: string;
};

const FIELDS: FieldConfig[] = [
  { key: 'name',     placeholder: 'Nombre completo',    fullWidth: true,  icon: 'person-outline' },
  { key: 'email',    placeholder: 'Correo electrónico', keyboardType: 'email-address', autoCapitalize: 'none', icon: 'mail-outline' },
  { key: 'phone',    placeholder: 'Teléfono',           keyboardType: 'phone-pad', icon: 'call-outline' },
  { key: 'address',  placeholder: 'Dirección',          fullWidth: true,  icon: 'home-outline' },
  { key: 'country',  placeholder: 'País',               icon: 'earth-outline' },
  { key: 'city',     placeholder: 'Ciudad',             icon: 'business-outline' },
  { key: 'password', placeholder: 'Contraseña',         secure: true,     icon: 'lock-closed-outline' },
  { key: 'confirm',  placeholder: 'Repetir contraseña', secure: true,     icon: 'lock-closed-outline' },
];

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNav>();
  const { signUp } = useAuth();

  const [form, setForm] = useState<Record<string, string>>({
    name: '', email: '', phone: '', address: '',
    city: '', country: '', password: '', confirm: '',
  });
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState<FieldErrors>({});

  const clearErrors = () => setErrors({});

  const setField = (key: string) => (value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    clearErrors();
  };

  const handleRegister = async () => {
    const localErrors: FieldErrors = {};

    if (!form.name.trim())     localErrors.name     = 'El nombre es obligatorio.';
    if (!form.email.trim())    localErrors.email    = 'El correo es obligatorio.';
    if (!form.phone.trim())    localErrors.phone    = 'El teléfono es obligatorio.';
    if (!form.address.trim())  localErrors.address  = 'La dirección es obligatoria.';
    if (!form.city.trim())     localErrors.city     = 'La ciudad es obligatoria.';
    if (!form.country.trim())  localErrors.country  = 'El país es obligatorio.';
    if (!form.password.trim()) localErrors.password = 'La contraseña es obligatoria.';
    if (!form.confirm.trim())  localErrors.confirm  = 'Debes repetir la contraseña.';
    else if (form.password !== form.confirm)
                               localErrors.confirm  = 'Las contraseñas no coinciden.';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      await signUp({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password.trim(),
        phone:    form.phone.trim(),
        address:  form.address.trim(),
        city:     form.city.trim(),
        country:  form.country.trim(),
      });
      navigation.navigate('Home');
    } catch (err: unknown) {
      setErrors(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
      />

      <View style={styles.grid}>
        {FIELDS.map(({ key, placeholder, keyboardType, autoCapitalize, secure, fullWidth, icon }) => (
          <View key={key} style={[styles.fieldWrapper, fullWidth && styles.fieldFull]}>
            <View style={[styles.inputContainer, errors[key] && styles.inputError]}>
              <Ionicons name={icon as any} size={20} color="#999" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType ?? 'default'}
                autoCapitalize={autoCapitalize ?? 'sentences'}
                secureTextEntry={secure && !showPassword}
                value={form[key]}
                onChangeText={setField(key)}
              />
              {secure && (
                <TouchableOpacity
                  onPress={() => setShowPassword(prev => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}
            </View>
            {errors[key] && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#d9534f" />
                <Text style={styles.errorText}>{errors[key]}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="warning-outline" size={16} color="#d9534f" />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Registrarse</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
    paddingTop: 48,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  fieldWrapper: {
    width: '49.65%',
  },
  fieldFull: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 50,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    ...(({ outlineWidth: 0, outlineStyle: 'none' } as any)),
  },
  inputError: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 11,
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#fdf0f0',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  generalErrorText: {
    color: '#d9534f',
    fontSize: 14,
    flexShrink: 1,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#103a57',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  link: {
    color: '#4A90E2',
    fontSize: 15,
  },
});