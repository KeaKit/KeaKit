import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, UserResponse } from '../../types';
import { createUser, updateUser } from '../../services/adminService';
import { SelectPicker } from '../../components/SelectPicker';
import { useLocationPicker } from '../../hooks/useLocationPicker';
import { Colors, Spacing, commonStyles } from '../../styles';

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

  const {
    countries,
    cities,
    loadingCities,
    onCountryChange,
  } = useLocationPicker();

  useEffect(() => {
    // Si estamos editando y el usuario ya tiene país, forzamos la carga de sus ciudades
    if (userToEdit?.country) {
      onCountryChange(userToEdit.country);
    }
  }, []);

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
    } catch (err: any) {
        try {
          const backendError = err.response?.data || err.message || err;
          const errorObj = typeof backendError === 'string' ? JSON.parse(backendError) : backendError;

          // Si es un objeto JSON del backend, lo pasamos DIRECTO al estado
          // Así errors.name recibe su error, errors.email el suyo, etc.
          if (typeof errorObj === 'object' && errorObj !== null) {
            setErrors(errorObj); 
          } else {
            setErrors({ general: String(errorObj) });
          }
        } catch (e) {
          setErrors({ general: err.message || "Error al guardar el usuario." });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={commonStyles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{userToEdit ? 'Editar Usuario' : 'Crear Usuario'}</Text>
            <View style={styles.headerRight} />
      </View>

      {/* NOMBRE */}
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nombre completo"
        value={name}
        onChangeText={(v) => { setName(v); clearErrors(); }}
      />
      {errors.name && <Text style={styles.fieldErrorText}>{errors.name}</Text>}

      {/* EMAIL */}
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(v) => { setEmail(v); clearErrors(); }}
      />
      {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}

      {/* TELÉFONO */}
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(v) => { setPhone(v); clearErrors(); }}
      />
      {errors.phone && <Text style={styles.fieldErrorText}>{errors.phone}</Text>}

      {/* DIRECCIÓN */}
      <TextInput
        style={[styles.input, errors.address && styles.inputError]} // Faltaba el array de estilos aquí
        placeholder="Dirección"
        value={address}
        onChangeText={(v) => { setAddress(v); clearErrors(); }}
      />
      {errors.address && <Text style={styles.fieldErrorText}>{errors.address}</Text>}

      {/* PAÍS (Selector desplegable) */}
      <View style={styles.pickerContainer}>
        <View style={[styles.pickerWrapper, errors.country && styles.inputError]}>
          <SelectPicker
            options={countries}
            selectedValue={country}
            placeholder="País"
            onValueChange={(value: string) => {
              onCountryChange(value);
              setCountry(value);
              setCity(''); // Reseteamos la ciudad al cambiar de país
              clearErrors();
            }}
          />
        </View>
      </View>
      {errors.country && <Text style={styles.fieldErrorText}>{errors.country}</Text>}

      {/* CIUDAD (Selector desplegable) */}
      <View style={styles.pickerContainer}>
        <View style={[styles.pickerWrapper, errors.city && styles.inputError]}>
          {loadingCities ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 12 }} />
          ) : (
            <SelectPicker
              options={cities.map((c: string) => ({ label: c, value: c }))}
              selectedValue={city}
              placeholder={country ? 'Ciudad' : 'Primero elige un país'}
              disabled={cities.length === 0}
              onValueChange={(value: string) => {
                setCity(value);
                clearErrors();
              }}
            />
          )}
        </View>
      </View>
      {errors.city && <Text style={styles.fieldErrorText}>{errors.city}</Text>}

      {/* CONTRASEÑA */}
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
      {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}

      {/* ROL */}
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

      {/* ERROR GENERAL (Por si falla el internet o algo que no sea de un campo específico) */}
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
      
      {/* MODAL DE ROL (Se queda igual) */}
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
  fieldErrorText: { 
    color: '#d9534f', 
    fontSize: 12, 
    marginTop: 4, 
    marginLeft: 4 
  },
    backButton: {
    padding: Spacing.sm,
  },
    headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  pickerContainer: { 
    padding: 0, 
    justifyContent: 'center',
  },
  pickerWrapper: {
    height: 50, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});