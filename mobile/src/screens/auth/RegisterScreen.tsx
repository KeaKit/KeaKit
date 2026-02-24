import React, { useState } from 'react';
import {
  ActivityIndicator,
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
  password?: string;
  confirm?: string;
  general?: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al registrarse.' };

  const message = err.message.toLowerCase();

  if (message.includes('email already') || message.includes('already registered') || message.includes('duplicate'))
    return { email: 'Este correo ya está registrado.' };

  if (message.includes('invalid email') || message.includes('email format'))
    return { email: 'El formato del correo no es válido.' };

  if (message.includes('password too short') || message.includes('weak password'))
    return { password: 'La contraseña es demasiado débil (mínimo 8 caracteres).' };

  if (message.includes('network') || message.includes('fetch'))
    return { general: 'Sin conexión. Comprueba tu red.' };

  if (message.includes('too many requests') || message.includes('rate limit'))
    return { general: 'Demasiados intentos. Espera unos minutos.' };

  return { general: err.message || 'Error al registrarse.' };
};

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNav>();
  const { signUp } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]     = useState<FieldErrors>({});

  const clearErrors = () => setErrors({});

  const handleRegister = async () => {
    const localErrors: FieldErrors = {};

    if (!name.trim())    localErrors.name     = 'El nombre es obligatorio.';
    if (!email.trim())   localErrors.email    = 'El correo es obligatorio.';
    if (!password)       localErrors.password = 'La contraseña es obligatoria.';
    if (!confirm)        localErrors.confirm  = 'Debes repetir la contraseña.';
    else if (password !== confirm)
                         localErrors.confirm  = 'Las contraseñas no coinciden.';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      await signUp({ name: name.trim(), email: email.trim(), password: password.trim() });
      navigation.navigate('Home');
    } catch (err: unknown) {
      setErrors(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 200, height: 200, marginBottom: 50 }}
        />
      </View>

      {/* Nombre */}
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nombre completo"
        placeholderTextColor="#999"
        value={name}
        onChangeText={(v) => { setName(v); clearErrors(); }}
      />
      {errors.name && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
          <Text style={styles.errorText}>{errors.name}</Text>
        </View>
      )}

      {/* Email */}
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(v) => { setEmail(v); clearErrors(); }}
      />
      {errors.email && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
          <Text style={styles.errorText}>{errors.email}</Text>
        </View>
      )}

      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(v) => { setPassword(v); clearErrors(); }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={25}
            color="#999"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
          <Text style={styles.errorText}>{errors.password}</Text>
        </View>
      )}

      {/* Repetir contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.confirm && styles.inputError]}
          placeholder="Repetir contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={confirm}
          onChangeText={(v) => { setConfirm(v); clearErrors(); }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={25}
            color="#999"
          />
        </TouchableOpacity>
      </View>
      {errors.confirm && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
          <Text style={styles.errorText}>{errors.confirm}</Text>
        </View>
      )}

      {/* Error general de backend */}
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 10,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 13,
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
    marginBottom: 12,
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
    marginTop: 8,
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
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    marginBottom: 10,
  },
});