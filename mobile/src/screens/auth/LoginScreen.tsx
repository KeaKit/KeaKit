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
import Divider from '../../components/Divider';

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al iniciar sesión.' };

  const message = err.message.toLowerCase();

  if (message.includes('user not found') || message.includes('no user'))
    return { email: 'No existe una cuenta con este correo.' };

  if (message.includes('wrong password') || message.includes('invalid password') || message.includes('incorrect password'))
    return { password: 'Contraseña incorrecta.' };

  if (message.includes('network') || message.includes('fetch'))
    return { general: 'Sin conexión. Comprueba tu red.' };

  return { general: err.message || 'Error al iniciar sesión.' };
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]     = useState<FieldErrors>({});

  const clearErrors = () => setErrors({});

  const handleLogin = async () => {
    clearErrors();

    if (!email.trim() || !password.trim()) {
      setErrors({
        email: !email.trim() ? 'El correo es obligatorio.' : undefined,
        password: !password.trim() ? 'La contraseña es obligatoria.' : undefined,
      });
      return;
    }

    try {
      setLoading(true);
      await signIn({ email: email.trim(), password });
      navigation.navigate('Home');
    } catch (err: unknown) {
      const parsed = parseBackendError(err);
      setErrors(parsed);
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

      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="warning-outline" size={16} color="#d9534f" />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <Divider />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  link: {
    color: '#4A90E2',
    fontSize: 15,
    marginTop: 20,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
});