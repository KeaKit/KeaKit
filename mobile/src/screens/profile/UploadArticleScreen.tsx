import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { uploadArticle, uploadArticleWithImage } from '../../services/articleService';
import { fetchAllCategories } from '../../services/categoryService';
import { ArticlePayload, ArticleCondition, RootStackParamList, Category } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { es, registerTranslation } from 'react-native-paper-dates';
import { useLocationPicker } from '../../hooks/useLocationPicker';
import { SelectPicker } from '../../components/SelectPicker';
import { useNotification } from '../../components/NotificationContext';


registerTranslation('es', es);

type UploadNav = NativeStackNavigationProp<RootStackParamList, 'UploadArticle'>;

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

const isValidIsoDate = (iso: string): boolean => {
  if (!iso) return true;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const hasAtMostTwoDecimals = (value: string): boolean =>
  /^\d+(\.\d{1,2})?$/.test(value.trim());

const UploadArticleScreen: React.FC = () => {
  const navigation = useNavigation<UploadNav>();
  const { user } = useAuth();
  const token = (user as any)?.token || '';
  const { showNotification } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string } | null>(null);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalUnits, setTotalUnits] = useState('1');
  const [condition, setCondition] = useState<'NEW' | 'LIGHTLY_USED' | 'USED' | 'WORN' | ''>('');

  const conditionOptions: { value: 'NEW' | 'LIGHTLY_USED' | 'USED' | 'WORN'; label: string }[] = [
    { value: 'NEW',          label: 'Nuevo' },
    { value: 'LIGHTLY_USED', label: 'Poco usado' },
    { value: 'USED',         label: 'Usado' },
    { value: 'WORN',         label: 'Desgastado' },
  ];

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

  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [purchaseDateObj, setPurchaseDateObj] = useState<Date | undefined>(undefined);

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({ uri: asset.uri, name: asset.uri.split('/').pop() || 'image.jpg' });
        clearError('image');
      }
    } catch {
      showNotification('No se pudo seleccionar la imagen', 'error');
    }
  };

  const takePicture = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showNotification('Se requiere acceso a la cámara para tomar fotos', 'error');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({ uri: asset.uri, name: `photo_${Date.now()}.jpg` });
        clearError('image');
      }
    } catch {
      showNotification('No se pudo tomar la foto', 'error');
    }
  };

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim())       newErrors.title       = 'El título es obligatorio';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (description.length > 1000) newErrors.description = 'La descripción no puede superar los 1000 caracteres';
    if (!selectedCountry)    newErrors.country     = 'El país es obligatorio';
    if (!selectedCity)       newErrors.city        = 'La ciudad es obligatoria';
    if (!selectedCategory)   newErrors.category    = 'Selecciona una categoría';

    if (!pricePerMonth || isNaN(Number(pricePerMonth)) || Number(pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Introduce un precio válido';
    } else if (!hasAtMostTwoDecimals(pricePerMonth)) {
      newErrors.pricePerMonth = 'El precio no puede tener más de 2 decimales';
    } else if (selectedCategory) {
      const price = Number(pricePerMonth);
      if (price < selectedCategory.minPrice || price > selectedCategory.maxPrice)
        newErrors.pricePerMonth = `El precio debe estar entre ${selectedCategory.minPrice}€ y ${selectedCategory.maxPrice}€`;
    }

    if (!availableFrom)  newErrors.availableFrom  = 'Selecciona la fecha de inicio';
    if (!availableUntil) newErrors.availableUntil = 'Selecciona la fecha de fin';
    if (availableFrom && availableUntil && availableFrom >= availableUntil)
      newErrors.availableUntil = 'Debe ser posterior a la fecha de inicio';
    if (purchaseDate && !isValidIsoDate(purchaseDate))
      newErrors.purchaseDate = 'Fecha de compra no válida';

    if (!totalUnits || isNaN(Number(totalUnits)) || Number(totalUnits) < 1 || !Number.isInteger(Number(totalUnits))) {
      newErrors.totalUnits = 'Introduce un número de unidades válido (mínimo 1)';
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
      showNotification('Debes iniciar sesión para subir un artículo', 'error');
      return; 
    }
    setLoading(true);
    try {
      const payload: ArticlePayload = {
        title:         title.trim(),
        description:   description.trim(),
        city:          selectedCity,
        pricePerMonth: Number(pricePerMonth),
        totalUnits:    Number(totalUnits),
        availableFrom,
        availableUntil,
        category:      { id: selectedCategory!.id } as any,
        status:        'AVAILABLE',
        ...(condition           && { condition:    condition as ArticleCondition }),
        ...(purchaseDate.trim() && { purchaseDate: purchaseDate.trim() }),
      };
      if (selectedImage) {
        await uploadArticleWithImage(user.id, selectedCategory!.id, user.token, payload, selectedImage.uri, selectedImage.name);
      } else {
        await uploadArticle(user.id, selectedCategory!.id, user.token, payload);
      }
      
      showNotification('Artículo publicado correctamente', 'success');
      navigation.goBack();
    } catch (error: any) {
      showNotification(error.message ?? 'No se pudo subir el artículo', 'error'); 
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
        <View style={commonStyles.header}>
          <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo artículo</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>
            <Field label="Título" value={title} onChange={(t) => { setTitle(t); clearError('title'); }} placeholder="Ej: Taladro percutor Bosch" error={errors.title} />
            <Field label="Descripción" value={description} onChange={(t) => { setDescription(t); clearError('description'); }} placeholder="Describe el estado, accesorios incluidos..." multiline error={errors.description} />

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
              label="Unidades disponibles"
              value={totalUnits}
              onChange={(t) => { setTotalUnits(t); clearError('totalUnits'); }}
              placeholder="Ej: 1"
              keyboardType="numeric"
              error={errors.totalUnits}
            />
            <Field
              label="Precio por mes (€)"
              value={pricePerMonth}
              onChange={(t) => { setPricePerMonth(t); clearError('pricePerMonth'); }}
              placeholder="Ej: 25.00"
              keyboardType="numeric"
              error={errors.pricePerMonth}
            />
            {selectedCategory && (
              <Text style={styles.helperText}>{`Precio entre ${selectedCategory.minPrice}€ y ${selectedCategory.maxPrice}€`}</Text>
            )}

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

          {/* Información adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información adicional</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Estado de conservación <Text style={styles.optional}>(opcional)</Text></Text>
              <View style={styles.conditionRow}>
                {conditionOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.conditionChip, condition === opt.value && styles.conditionChipActive]}
                    onPress={() => setCondition(condition === opt.value ? '' : opt.value)}
                  >
                    <Text style={[styles.conditionChipText, condition === opt.value && styles.conditionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Foto del artículo <Text style={styles.optional}>(opcional)</Text></Text>
            <View style={styles.imageSelectorContainer}>
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.changeImageButton} onPress={() => setSelectedImage(null)}>
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.imagePlaceholder, errors.image ? { borderColor: Colors.error } : null]}>
                  <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
                  <Text style={styles.placeholderText}>Sube una foto de tu artículo</Text>
                </View>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Ionicons name="images" size={20} color={Colors.primary} />
                  <Text style={styles.imageButtonText}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={takePicture}>
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                  <Text style={styles.imageButtonText}>Cámara</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Fecha de compra</Text>
                <Text style={styles.optional}> (opcional)</Text>
              </View>
              <TouchableOpacity
                style={[commonStyles.input, styles.dateSelector, errors.purchaseDate ? commonStyles.inputError : null]}
                onPress={() => setShowPurchaseDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateSelectorText, !purchaseDate && { color: Colors.textSecondary }]}>
                  {purchaseDate ? toDisplay(purchaseDate) : 'Selecciona la fecha de compra'}
                </Text>
                <View style={styles.dateRightIcons}>
                  {purchaseDate && (
                    <TouchableOpacity onPress={() => { setPurchaseDate(''); setPurchaseDateObj(undefined); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                </View>
              </TouchableOpacity>
              {!!errors.purchaseDate && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.purchaseDate}</Text>
                </View>
              )}
              <DatePickerModal
                locale="es"
                mode="single"
                visible={showPurchaseDatePicker}
                onDismiss={() => setShowPurchaseDatePicker(false)}
                date={purchaseDateObj}
                allowEditing={false}
                onConfirm={(params: { date?: Date }) => {
                  setShowPurchaseDatePicker(false);
                  if (params.date) {
                    setPurchaseDateObj(params.date);
                    setPurchaseDate(toIso(params.date));
                    clearError('purchaseDate');
                  }
                }}
                validRange={{ endDate: new Date() }}
              />
            </View>
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
                <Ionicons name="cloud-upload-outline" size={20} color={Colors.textWhite} />
                <Text style={[commonStyles.primaryButtonText, { marginLeft: Spacing.sm }]}>Publicar artículo</Text>
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
  // ── Layout ────────────────────────────────────────────────────────────────
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

  // ── Fields ────────────────────────────────────────────────────────────────
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

  // ── Location pickers ──────────────────────────────────────────────────────
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

  // ── Category dropdown ─────────────────────────────────────────────────────
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

  // ── Date selectors ────────────────────────────────────────────────────────
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
  dateRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // ── Image picker ──────────────────────────────────────────────────────────
  imageSelectorContainer: {
    gap: Spacing.sm,
  },
  selectedImageContainer: {
    position: 'relative',
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  changeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
  },
  imagePlaceholder: {
    height: 180,
    width: '100%',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: 8,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  imageButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // ── Condition chips ───────────────────────────────────────────────────────
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  conditionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
  },
  conditionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  conditionChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  conditionChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default UploadArticleScreen;