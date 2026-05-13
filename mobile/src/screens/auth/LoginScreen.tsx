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
import { Helmet } from 'react-helmet-async'; 

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al iniciar sesión.' };
  const message = err.message.toLowerCase();
  if (message.includes('user not found'))
    return { email: 'No existe una cuenta con este correo.' };
  if (message.includes('invalid password'))
    return { password: 'Contraseña incorrecta.' };
  return { general: err.message || 'Error al iniciar sesión.' };
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();
  const { signIn } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState<FieldErrors>({});

  const clearErrors = () => setErrors({});

  const handleLogin = async () => {
    clearErrors();

    if (!email.trim() || !password.trim()) {
      setErrors({
        email:    !email.trim()    ? 'El correo es obligatorio.'    : undefined,
        password: !password.trim() ? 'La contraseña es obligatoria.' : undefined,
      });
      return;
    }

    try {
      setLoading(true);
      await signIn({ email: email.trim(), password });
      navigation.navigate('Home');
    } catch (err: unknown) {
      setErrors(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Helmet>
        <title>Iniciar Sesión | KeaKit</title>
        <meta name="description" content="Inicia sesión en KeaKit y gestiona tus alquileres de kits de forma flexible." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#103a57" />
        </TouchableOpacity>
      )}

      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: 200, height: 200, marginBottom: 50 }}
      />

      <View style={[styles.inputContainer, errors.email && styles.inputError]}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.fieldIcon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => { setEmail(v); clearErrors(); }}
        />
      </View>
      {errors.email && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
          <Text style={styles.errorText}>{errors.email}</Text>
        </View>
      )}

      <View style={[styles.inputContainer, errors.password && styles.inputError]}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.fieldIcon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(v) => { setPassword(v); clearErrors(); }}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} activeOpacity={0.7}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
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
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Iniciar sesión</Text>
        }
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
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 50,
    marginTop: 10,
  },
  inputError: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    ...(({ outlineWidth: 0, outlineStyle: 'none' } as any)),
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 2,
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
    marginBottom: 4,
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
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
});