import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, UserResponse } from '../../types';
import { createUser, updateUser } from '../../services/adminService';
import { Colors, Spacing } from '../../styles';

type AdminUserFormNav = NativeStackNavigationProp<RootStackParamList, 'AdminUsers'>;
type AdminUserFormRoute = RouteProp<RootStackParamList, 'AdminUsers'>;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const AdminUserFormScreen: React.FC = () => {
  const navigation = useNavigation<AdminUserFormNav>();
  const route = useRoute<AdminUserFormRoute>();
  const { user: authUser } = useAuth();

  // Para editar
  const userToEdit = (route.params as any)?.user as UserResponse | undefined;

  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  if (!authUser) return null; // fallback

  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    const localErrors: FieldErrors = {};
    if (!name.trim()) localErrors.name = 'El nombre es obligatorio';
    if (!email.trim()) localErrors.email = 'El email es obligatorio';
    if (!userToEdit && !password) localErrors.password = 'La contraseña es obligatoria al crear';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      if (userToEdit) {
        // Editar
        await updateUser(userToEdit.id, { name: name.trim(), email: email.trim(), password: password || undefined }, authUser.token);
      } else {
        // Crear
        await createUser({ name: name.trim(), email: email.trim(), password: password.trim() }, authUser.token);
      }
      navigation.goBack();
    } catch (err: unknown) {
      setErrors({ general: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userToEdit ? 'Editar Usuario' : 'Crear Usuario'}</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nombre completo"
        value={name}
        onChangeText={(v) => { setName(v); clearErrors(); }}
      />
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(v) => { setEmail(v); clearErrors(); }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(v) => { setPassword(v); clearErrors(); }}
        />
        <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{userToEdit ? 'Actualizar' : 'Crear'}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default AdminUserFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { height: 50, backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: '#ddd' },
  inputError: { borderColor: '#d9534f' },
  inputContainer: { position: 'relative', marginTop: 10 },
  eyeIcon: { position: 'absolute', right: 12, top: 12 },
  button: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  errorText: { color: '#d9534f', marginTop: 6 },
});