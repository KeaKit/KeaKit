import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
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
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
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
  const [phone, setPhone] = useState(userToEdit?.phone || '');
  const [address, setAddress] = useState(userToEdit?.address || '');
  const [city, setCity] = useState(userToEdit?.city || '');
  const [country, setCountry] = useState(userToEdit?.country || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState<"USER" | "COURIER" | "ADMIN">(userToEdit?.role ?? "USER");
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const roleLabel = (value: "USER" | "COURIER" | "ADMIN") => {
    switch (value) {
      case "ADMIN": return "Administrador";
      case "COURIER": return "Repartidor";
      default: return "Usuario";
    }
  };


  if (!authUser) return null; // fallback

  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    const localErrors: FieldErrors = {};
    if (!name.trim()) localErrors.name = 'El nombre es obligatorio';
    if (!email.trim()) localErrors.email = 'El email es obligatorio';
    if (!phone.trim()) localErrors.phone = 'El teléfono es obligatorio';
    if (!address.trim()) localErrors.address = 'La dirección es obligatoria';
    if (!city.trim()) localErrors.city = 'La ciudad es obligatoria';
    if (!country.trim()) localErrors.country = 'El país es obligatorio';
    if (!userToEdit && !password) localErrors.password = 'La contraseña es obligatoria al crear';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      if (userToEdit) {
        // Editar
        await updateUser(userToEdit.id, { 
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          role,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          country: country.trim()
        }, authUser.token);
      } else {
        // Crear
        await createUser({ 
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          country: country.trim()
        }, authUser.token);
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
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={phone}
        onChangeText={(v) => { setPhone(v); clearErrors(); }}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={address}
        onChangeText={(v) => { setAddress(v); clearErrors(); }}
      />
      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        value={city}
        onChangeText={(v) => { setCity(v); clearErrors(); }}
      />
      <TextInput
        style={styles.input}
        placeholder="País"
        value={country}
        onChangeText={(v) => { setCountry(v); clearErrors(); }}
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

      <TouchableOpacity
        style={styles.roleField}
        onPress={() => setRoleModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.roleLabel}>Rol</Text>
        <View style={styles.roleValueRow}>
          <Text style={styles.roleValue}>{roleLabel(role)}</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </View>
      </TouchableOpacity>


      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
      
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona rol</Text>

            {(["USER", "COURIER", "ADMIN"] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.modalOption, role === r && styles.modalOptionSelected]}
                onPress={() => {
                  setRole(r);
                  setRoleModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, role === r && styles.modalOptionTextSelected]}>
                  {roleLabel(r)}
                </Text>
                {role === r && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  roleField: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
  },
  roleLabel: { fontSize: 12, color: "#666", marginBottom: 6 },
  roleValueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roleValue: { fontSize: 16, fontWeight: "600", color: "#222" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f7f7f7",
    marginBottom: 8,
  },
  modalOptionSelected: { backgroundColor: "#eaf2ff" },
  modalOptionText: { fontSize: 16, color: "#333" },
  modalOptionTextSelected: { color: Colors.primary, fontWeight: "700" },
  modalCancel: { marginTop: 10, alignItems: "center" },
  modalCancelText: { color: "#666", fontWeight: "600" },

});