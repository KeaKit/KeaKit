import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { promoteService } from '../../services/servicesService';
import { fetchAllCategories } from '../../services/categoryService';
import { validatePromoCode } from '../../services/promoCodeService';
import { ServicePayload, RootStackParamList, Category } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { es, registerTranslation } from 'react-native-paper-dates';
import { useLocationPicker } from '../../hooks/useLocationPicker';
import { SelectPicker } from '../../components/SelectPicker';
import { useNotification } from '../../components/NotificationContext';
import { Helmet } from 'react-helmet-async'; 

const MAX_TITLE_LENGTH = 255;
const MAX_TOTAL_UNITS = 2147483647;

registerTranslation('es', es);

type PromoteServiceNav = NativeStackNavigationProp<RootStackParamList, 'PromoteService'>;

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  optional?: boolean;
  error?: string;
}

const Field: React.FC<FieldProps> = ({
  label, value, onChange, placeholder, keyboardType = 'default',
  multiline = false, optional = false, error,
}) => (
  <View style={styles.fieldContainer}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {optional && <Text style={styles.optional}> (opcional)</Text>}
    </View>
    <TextInput
      style={[
        commonStyles.input,
        multiline && styles.textarea,
        error ? commonStyles.inputError : null,
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={Colors.textSecondary}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
    {!!error && (
      <View style={commonStyles.errorContainer}>
        <Ionicons name="alert-circle" size={14} color={Colors.error} />
        <Text style={commonStyles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const toDisplay = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const hasAtMostTwoDecimals = (value: string): boolean =>
  /^\d+(\.\d{1,2})?$/.test(value.trim());

const PromoteServiceScreen: React.FC = () => {
  const navigation = useNavigation<PromoteServiceNav>();
  const { user } = useAuth();
  const token = (user as any)?.token || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [totalUnits, setTotalUnits] = useState('1');
  const [ownerCommissionPromoCode, setOwnerCommissionPromoCode] = useState('');

  const {
    selectedCountry,
    selectedCity,
    setSelectedCity,
    cities,
    countries,
    loadingCities,
    onCountryChange,
  } = useLocationPicker();

  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [appliedOwnerPromoCode, setAppliedOwnerPromoCode] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; valid: boolean } | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;
      try {
        const data = await fetchAllCategories(token);
        setDbCategories(data.filter(c => c.status === 'ACTIVE'));
      } catch {
        showNotification('No se pudieron cargar las categorías', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [token]);

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }));

  const handleApplyPromo = async () => {
    const code = ownerCommissionPromoCode.trim().toUpperCase();
    if (!code || !user?.email || !user?.token) return;

    setPromoLoading(true);
    try {
      const result = await validatePromoCode(
        user.token,
        code,
        user.email,
        'OWNER_COMMISSION_REDUCTION',
      );

      if (result.valid) {
        setAppliedOwnerPromoCode(code);
        setPromoMessage({ text: `Realizado: ${result.message}`, valid: true });
      } else {
        setAppliedOwnerPromoCode(null);
        setPromoMessage({ text: result.message, valid: false });
      }
    } catch {
      setAppliedOwnerPromoCode(null);
      setPromoMessage({ text: 'Error al validar el código', valid: false });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setOwnerCommissionPromoCode('');
    setAppliedOwnerPromoCode(null);
    setPromoMessage(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (title.trim().length > MAX_TITLE_LENGTH) {
      newErrors.title = `El título no puede superar los ${MAX_TITLE_LENGTH} caracteres`;
    }

    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (description.length > 1000) newErrors.description = 'La descripción no puede superar los 1000 caracteres';
    if (!selectedCountry) newErrors.country = 'El país es obligatorio';
    if (!selectedCity) newErrors.city = 'La ciudad es obligatoria';
    if (!selectedCategory) newErrors.category = 'Selecciona una categoría';

    if (!pricePerMonth || isNaN(Number(pricePerMonth)) || Number(pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Introduce un precio válido';
    } else if (!hasAtMostTwoDecimals(pricePerMonth)) {
      newErrors.pricePerMonth = 'El precio no puede tener más de 2 decimales';
    } else if (Number(pricePerMonth) > 999999999) {
      newErrors.pricePerMonth = 'El precio es demasiado alto';
    } else if (selectedCategory) {
      const price = Number(pricePerMonth);
      if (price < selectedCategory.minPrice || price > selectedCategory.maxPrice) {
        newErrors.pricePerMonth = `El precio debe estar entre ${selectedCategory.minPrice}€ y ${selectedCategory.maxPrice}€`;
      }
    }

    if (totalUnits) {
      const unitsNum = Number(totalUnits);
      if (isNaN(unitsNum) || unitsNum < 1 || unitsNum > MAX_TOTAL_UNITS) {
        newErrors.totalUnits = `Las unidades deben ser un número entre 1 y ${MAX_TOTAL_UNITS.toLocaleString()}`;
      } else if (!Number.isInteger(unitsNum)) {
        newErrors.totalUnits = 'Las unidades deben ser un número entero';
      }
    }

    if (!availableFrom) newErrors.availableFrom = 'Selecciona la fecha de inicio';
    if (!availableUntil) newErrors.availableUntil = 'Selecciona la fecha de fin';
    if (availableFrom && availableUntil && availableFrom >= availableUntil) {
      newErrors.availableUntil = 'Debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showNotification(firstError, 'error');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      showNotification('Debes iniciar sesión para publicar un servicio', 'error');
      return;
    }

    setLoading(true);
    try {
      const trimmedOwnerPromoCode = ownerCommissionPromoCode.trim();
      if (trimmedOwnerPromoCode && appliedOwnerPromoCode !== trimmedOwnerPromoCode) {
        showNotification('Debes pulsar Aplicar para validar el código promocional', 'error');
        setLoading(false);
        return;
      }

      const payload: ServicePayload = {
        title: title.trim(),
        description: description.trim(),
        city: selectedCity,
        pricePerMonth: Number(pricePerMonth),
        availableFrom,
        availableUntil,
        category: { id: selectedCategory!.id },
        status: 'ACTIVE',
        totalUnits: totalUnits ? Number(totalUnits) : 1,
        ...(appliedOwnerPromoCode && { ownerCommissionPromoCode: appliedOwnerPromoCode }),
      };

      await promoteService(user.id, selectedCategory!.id, user.token, payload);
      
      showNotification(
        '¡Servicio publicado correctamente!',
        'success',
        {
          label: 'Ver servicios',
          onPress: () => navigation.navigate('MyServices' as any)
        }
      );
      
      navigation.goBack();
      
    } catch (error: any) {
      showNotification(
        error.message ?? 'Error al publicar el servicio',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const customTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.primary,
      onPrimary: '#FFFFFF',
      primaryContainer: '#E3F2FD',
      onPrimaryContainer: Colors.primary,
      surface: '#FFFFFF',
      onSurface: '#1C1B1F',
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        <Helmet>
          <title>Publicar un servicio | KeaKit</title>
          <meta name="description" content="Publica un nuevo servicio en KeaKit incluyendo toda la información necesaria."/>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>          
        <View style={commonStyles.header}>
          <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar Servicio</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del servicio</Text>
            
            <Field
              label="Título"
              value={title}
              onChange={(t) => { setTitle(t); clearError('title'); }}
              placeholder="Ej: Clases de guitarra, Reparaciones, Asesoría..."
              error={errors.title}
            />
            
            <Field
              label="Descripción"
              value={description}
              onChange={(t) => { setDescription(t); clearError('description'); }}
              placeholder="Describe el servicio, experiencia, disponibilidad..."
              multiline
              error={errors.description}
            />

            {/* País */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>País</Text>
              <View style={[styles.pickerWrapper, errors.country ? styles.pickerWrapperError : null]}>
                <Ionicons name="earth-outline" size={18} color={Colors.textSecondary} style={styles.pickerIcon} />
                <SelectPicker
                  options={countries}
                  selectedValue={selectedCountry}
                  placeholder="Selecciona un país"
                  onValueChange={(value: string) => {
                    onCountryChange(value);
                    clearError('country');
                    clearError('city');
                  }}
                />
              </View>
              {!!errors.country && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.country}</Text>
                </View>
              )}
            </View>

            {/* Ciudad */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Ciudad</Text>
              <View style={[styles.pickerWrapper, errors.city ? styles.pickerWrapperError : null]}>
                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} style={styles.pickerIcon} />
                {loadingCities ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1 }} />
                ) : (
                  <SelectPicker
                    options={cities.map(c => ({ label: c, value: c }))}
                    selectedValue={selectedCity}
                    placeholder={selectedCountry ? 'Selecciona una ciudad' : 'Primero elige un país'}
                    disabled={cities.length === 0}
                    onValueChange={(value: string) => {
                      setSelectedCity(value);
                      clearError('city');
                    }}
                  />
                )}
              </View>
              {!!errors.city && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.city}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <TouchableOpacity
              style={[commonStyles.input, styles.categorySelector, errors.category ? commonStyles.inputError : null]}
              onPress={() => !loadingCategories && setCategoryOpen((o) => !o)}
              activeOpacity={0.8}
            >
              {loadingCategories ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={[styles.categorySelectorText, !selectedCategory && { color: Colors.textSecondary }]}>
                  {selectedCategory ? selectedCategory.name : 'Selecciona una categoría'}
                </Text>
              )}
              <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {!!errors.category && (
              <View style={commonStyles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.category}</Text>
              </View>
            )}
            {categoryOpen && dbCategories.length > 0 && (
              <View style={styles.categoryDropdown}>
                {dbCategories.map((cat, index) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      index === dbCategories.length - 1 && { borderBottomWidth: 0 },
                      selectedCategory?.id === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                      clearError('category');
                      clearError('pricePerMonth');
                    }}
                  >
                    <Text style={[styles.categoryOptionText, selectedCategory?.id === cat.id && styles.categoryOptionTextSelected]}>
                      {cat.name}
                    </Text>
                    {selectedCategory?.id === cat.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Precio y disponibilidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precio y disponibilidad</Text>
            
            <Field
              label="Precio por mes (€)"
              value={pricePerMonth}
              onChange={(t) => { setPricePerMonth(t); clearError('pricePerMonth'); }}
              placeholder="Ej: 150.00"
              keyboardType="numeric"
              error={errors.pricePerMonth}
            />
            {selectedCategory && (
              <Text style={styles.helperText}>{`Precio entre ${selectedCategory.minPrice}€ y ${selectedCategory.maxPrice}€`}</Text>
            )}

            <Field
              label="Unidades disponibles"
              value={totalUnits}
              onChange={(t) => {
                const cleaned = t.replace(/[^0-9]/g, '');
                if (cleaned.length <= 10) {
                  setTotalUnits(cleaned);
                }
                clearError('totalUnits');
              }}
              placeholder="Ej: 1"
              keyboardType="numeric"
              optional
              error={errors.totalUnits}
            />

            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Código promo de comisión</Text>
                <Text style={styles.optional}> (opcional)</Text>
              </View>

              {appliedOwnerPromoCode ? (
                <View style={styles.promoAppliedRow}>
                  <View style={styles.promoAppliedBadge}>
                    <Ionicons name="pricetag" size={14} color="#4caf7d" />
                    <Text style={styles.promoAppliedCode}>{appliedOwnerPromoCode}</Text>
                  </View>
                  <TouchableOpacity onPress={handleRemovePromo} style={styles.promoRemoveBtn} disabled={loading}>
                    <Ionicons name="close-circle" size={20} color="#e74c3c" />
                    <Text style={styles.promoRemoveText}>Quitar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.promoInputRow}>
                    <TextInput
                      style={[
                        styles.promoInput,
                        promoMessage?.valid === false && styles.promoInputError,
                      ]}
                      value={ownerCommissionPromoCode}
                      onChangeText={(t) => {
                        setOwnerCommissionPromoCode(t.toUpperCase());
                        setPromoMessage(null);
                      }}
                      placeholder="OWNER10"
                      placeholderTextColor="#aaa"
                      autoCapitalize="characters"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={[styles.promoBtn, (!ownerCommissionPromoCode.trim() || promoLoading) && styles.promoBtnDisabled]}
                      onPress={handleApplyPromo}
                      disabled={!ownerCommissionPromoCode.trim() || promoLoading || loading}
                    >
                      {promoLoading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.promoBtnText}>Aplicar</Text>
                      }
                    </TouchableOpacity>
                  </View>
                  {promoMessage && (
                    <Text style={promoMessage.valid ? styles.promoSuccess : styles.promoError}>
                      {promoMessage.text}
                    </Text>
                  )}
                  <Text style={styles.helperText}>
                    Opcional. Solo se aceptan códigos del tipo comisión para arrendadores.
                  </Text>
                </>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Periodo de disponibilidad</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.dateSelector, (errors.availableFrom || errors.availableUntil) ? commonStyles.inputError : null]}
                onPress={() => setShowDateRangePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateSelectorText, !(availableFrom && availableUntil) && { color: Colors.textSecondary }]}>
                  {availableFrom && availableUntil
                    ? `${toDisplay(availableFrom)}  →  ${toDisplay(availableUntil)}`
                    : 'Selecciona el rango de disponibilidad'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {!!errors.availableFrom && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.availableFrom}</Text>
                </View>
              )}
              {!!errors.availableUntil && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.availableUntil}</Text>
                </View>
              )}
            </View>

            <DatePickerModal
              locale="es"
              mode="range"
              visible={showDateRangePicker}
              onDismiss={() => setShowDateRangePicker(false)}
              startDate={startDate}
              endDate={endDate}
              allowEditing={false}
              onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
                setShowDateRangePicker(false);
                if (params.startDate && params.endDate) {
                  setStartDate(params.startDate);
                  setEndDate(params.endDate);
                  setAvailableFrom(toIso(params.startDate));
                  setAvailableUntil(toIso(params.endDate));
                  clearError('availableFrom');
                  clearError('availableUntil');
                }
              }}
              validRange={{ startDate: new Date() }}
            />
          </View>

          <TouchableOpacity
            style={[commonStyles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <View style={styles.submitContent}>
                <Ionicons name="megaphone-outline" size={20} color={Colors.textWhite} />
                <Text style={[commonStyles.primaryButtonText, { marginLeft: Spacing.sm }]}>Publicar Servicio</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimaryHome,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldContainer: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimaryHome,
  },
  optional: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  textarea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerWrapperError: {
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  pickerIcon: {
    marginRight: Spacing.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorText: {
    fontSize: 15,
    color: Colors.textPrimaryHome,
  },
  categoryDropdown: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary + '12',
  },
  categoryOptionText: {
    fontSize: 15,
    color: Colors.textPrimaryHome,
  },
  categoryOptionTextSelected: {
    fontWeight: '700',
    color: Colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: -4,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimaryHome,
    fontSize: 15,
  },
  promoInputError: {
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  promoBtn: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnDisabled: {
    opacity: 0.6,
  },
  promoBtnText: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  promoSuccess: {
    color: '#2e8b57',
    fontSize: 12,
    marginTop: -4,
  },
  promoError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -4,
  },
  promoAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  promoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    backgroundColor: '#eaf8f0',
  },
  promoAppliedCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e8b57',
  },
  promoRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoRemoveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e74c3c',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 15,
    color: Colors.textPrimaryHome,
    flex: 1,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default PromoteServiceScreen;