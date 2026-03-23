import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { updateProfile } from '../../services/userService';
import { SelectPicker } from '../../components/SelectPicker';
import { useLocationPicker } from '../../hooks/useLocationPicker';
import { EUROPEAN_COUNTRIES } from '../../types';

type EditProfileNav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

type FieldErrors = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  general?: string;
};

type ProfileData = {
  name: string;
  phone: string;
  address: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al actualizar el perfil.' };
  const message = err.message.toLowerCase();
  if (message.includes('phone number must be valid'))
    return { phone: 'Número de teléfono no válido.' };
  return { general: err.message || 'Error al actualizar el perfil.' };
};

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNav>();
  const route = useRoute();
  const { user, setUser } = useAuth();
  
  const routeParams = (route.params as { user?: typeof user } | undefined);
  const profileUser = routeParams?.user || user;

  const [form, setForm] = useState<ProfileData>({
    name:    profileUser?.name    ?? '',
    phone:   profileUser?.phone   ?? '',
    address: profileUser?.address ?? '',
  });

  const {
    selectedCountry,
    selectedCity,
    setSelectedCity,
    cities,
    loadingCities,
    onCountryChange,
  } = useLocationPicker(profileUser?.country ?? '', profileUser?.city ?? '');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<FieldErrors>({});

  const clearErrors = () => setErrors({});

  const setField = (field: keyof ProfileData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearErrors();
  };

  const handleSave = async () => {
    const localErrors: FieldErrors = {};

    if (!form.name.trim())    localErrors.name    = 'El nombre es obligatorio.';
    if (!form.phone.trim())   localErrors.phone   = 'El teléfono es obligatorio.';
    if (!form.address.trim()) localErrors.address = 'La dirección es obligatoria.';
    if (!selectedCountry)     localErrors.country = 'El país es obligatorio.';
    if (!selectedCity)        localErrors.city    = 'La ciudad es obligatoria.';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateProfile(profileUser!.id, {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim(),
        city:    selectedCity,
        country: selectedCountry,
      }, profileUser!.token);
      setUser({
        ...user!,
        name:    updatedUser.name,
        phone:   updatedUser.phone,
        address: updatedUser.address,
        city:    updatedUser.city,
        country: updatedUser.country,
      });
      navigation.goBack();
    } catch (err: unknown) {
      setErrors(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    key: keyof ProfileData;
    placeholder: string;
    keyboardType?: 'default' | 'phone-pad' | 'email-address';
    icon: string;
  }[] = [
    { key: 'name',    placeholder: 'Nombre completo', icon: 'person-outline' },
    { key: 'phone',   placeholder: 'Teléfono',        icon: 'call-outline', keyboardType: 'phone-pad' },
    { key: 'address', placeholder: 'Dirección',       icon: 'home-outline' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#103a57" />
      </TouchableOpacity>

      <Image source={require('../../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Editar perfil</Text>
      <Text style={styles.subtitle}>{profileUser?.email}</Text>

      {fields.map(({ key, placeholder, keyboardType, icon }) => (
        <View key={key} style={styles.fieldWrapper}>
          <View style={styles.inputContainer}>
            <Ionicons name={icon as any} size={20} color="#999" style={styles.fieldIcon} />
            <TextInput
              style={[styles.input, errors[key] && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor="#999"
              keyboardType={keyboardType ?? 'default'}
              value={form[key]}
              onChangeText={setField(key)}
            />
          </View>
          {errors[key] && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
              <Text style={styles.errorText}>{errors[key]}</Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.fieldWrapper}>
        <View style={[styles.inputContainer, errors.country && styles.inputErrorBorder]}>
          <Ionicons name="earth-outline" size={20} color="#999" style={styles.fieldIcon} />
          <SelectPicker
            options={EUROPEAN_COUNTRIES}
            selectedValue={selectedCountry}
            placeholder="País"
            onValueChange={(value: string) => {
              onCountryChange(value);
              clearErrors();
            }}
          />
        </View>
        {errors.country && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
            <Text style={styles.errorText}>{errors.country}</Text>
          </View>
        )}
      </View>

      <View style={styles.fieldWrapper}>
        <View style={[styles.inputContainer, errors.city && styles.inputErrorBorder]}>
          <Ionicons name="business-outline" size={20} color="#999" style={styles.fieldIcon} />
          {loadingCities
            ? <ActivityIndicator size="small" color="#999" style={{ flex: 1 }} />
            : <SelectPicker
                options={cities.map(c => ({ label: c, value: c }))}
                selectedValue={selectedCity}
                placeholder={selectedCountry ? 'Ciudad' : 'Primero elige un país'}
                disabled={cities.length === 0}
                onValueChange={(value: string) => {
                  setSelectedCity(value);
                  clearErrors();
                }}
              />
          }
        </View>
        {errors.city && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#d9534f" />
            <Text style={styles.errorText}>{errors.city}</Text>
          </View>
        )}
      </View>

      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="warning-outline" size={16} color="#d9534f" />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Guardar cambios</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#103a57',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 4,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    ...(({ outlineWidth: 0, outlineStyle: 'none' } as any)),
  },
  inputError: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  inputErrorBorder: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 2,
    height: 20,
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
    marginTop: 8,
    marginBottom: 4,
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
});