import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { updateArticle } from '../../services/articleService';
import { fetchAllCategories } from '../../services/categoryService';
import { ArticlePayload, ArticleCondition, RootStackParamList, Category } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { es, registerTranslation } from 'react-native-paper-dates';

registerTranslation('es', es);

type EditNav   = NativeStackNavigationProp<RootStackParamList, 'EditArticle'>;
type EditRoute = RouteProp<RootStackParamList, 'EditArticle'>;

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
  label, value, onChange, placeholder,
  keyboardType = 'default', multiline = false, optional = false, error,
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

// ── Helper: Date → "YYYY-MM-DD" ─────────────────────────────────────────────
const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

// ── Helper: "YYYY-MM-DD" → "DD/MM/YYYY" para mostrar ────────────────────────
const toDisplay = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ── Helper: "YYYY-MM-DD" → Date ──────────────────────────────────────────────
const isoToDate = (iso: string | null | undefined): Date | undefined => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};


// ── Helper: valida que una fecha ISO sea real (mes/día válidos) ──────────────
const isValidIsoDate = (iso: string): boolean => {
  if (!iso) return true;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

// ── Helper: máximo 2 decimales ───────────────────────────────────────────────
const hasAtMostTwoDecimals = (value: string): boolean =>
  /^\d+(\.\d{1,2})?$/.test(value.trim());

const EditArticleScreen: React.FC = () => {
  const navigation  = useNavigation<EditNav>();
  const route       = useRoute<EditRoute>();
  const { user }    = useAuth();
  const { article } = route.params;

  const [title,          setTitle]          = useState(article.title ?? '');
  const [description,    setDescription]    = useState(article.description ?? '');
  const [city,           setCity]           = useState(article.city ?? '');
  const [pricePerMonth,  setPricePerMonth]  = useState(String(article.pricePerMonth ?? ''));
  const [availableFrom,  setAvailableFrom]  = useState(article.availableFrom ?? '');
  const [availableUntil, setAvailableUntil] = useState(article.availableUntil ?? '');
  const [category,       setCategory]       = useState<Category | null>(article.category ?? null);
  const [imageUrl,       setImageUrl]       = useState(article.imageUrl ?? '');
  const [purchaseDate,   setPurchaseDate]   = useState(article.purchaseDate ?? '');
  const [condition, setCondition] = useState<'NEW' | 'LIGHTLY_USED' | 'USED' | 'WORN' | ''>(article.condition ?? '');

  const conditionOptions: { value: 'NEW' | 'LIGHTLY_USED' | 'USED' | 'WORN'; label: string }[] = [
    { value: 'NEW',          label: 'Nuevo' },
    { value: 'LIGHTLY_USED', label: 'Poco usado' },
    { value: 'USED',         label: 'Usado' },
    { value: 'WORN',         label: 'Desgastado' },
  ];

  // Calendario disponibilidad
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(isoToDate(article.availableFrom));
  const [endDate,   setEndDate]   = useState<Date | undefined>(isoToDate(article.availableUntil));

  // Calendario fecha de compra
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [purchaseDateObj, setPurchaseDateObj] = useState<Date | undefined>(isoToDate(article.purchaseDate));

  const [loading,           setLoading]           = useState(false);
  const [errors,            setErrors]            = useState<Record<string, string>>({});
  const [categoryOpen,      setCategoryOpen]      = useState(false);
  const [dbCategories,      setDbCategories]      = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.token) return;
      try {
        const data = await fetchAllCategories(user.token);
        const activeCategories = data.filter(c => c.status === 'ACTIVE');
        setDbCategories(activeCategories);
      } catch (err) {
        Alert.alert('Aviso', 'No se pudieron cargar las categorías del servidor.');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [user?.token]);

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: '' }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim())       newErrors.title       = 'El título es obligatorio';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (description.length > 1000) newErrors.description = 'La descripción no puede superar los 1000 caracteres';
    if (!city.trim())        newErrors.city        = 'La ciudad es obligatoria';
    if (!category)           newErrors.category    = 'Selecciona una categoría';

    if (!pricePerMonth || isNaN(Number(pricePerMonth)) || Number(pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Introduce un precio válido';
    } else if (!hasAtMostTwoDecimals(pricePerMonth)) {
      newErrors.pricePerMonth = 'El precio no puede tener más de 2 decimales';
    } else if (category) {
      const price = Number(pricePerMonth);
      if (price < category.minPrice || price > category.maxPrice) {
        newErrors.pricePerMonth = `El precio debe estar entre ${category.minPrice}€ y ${category.maxPrice}€ para esta categoría`;
      }
    }

    if (!availableFrom)  newErrors.availableFrom  = 'Selecciona la fecha de inicio';
    if (!availableUntil) newErrors.availableUntil = 'Selecciona la fecha de fin';

    if (availableFrom && availableUntil && availableFrom >= availableUntil)
      newErrors.availableUntil = 'Debe ser posterior a la fecha de inicio';

    if (purchaseDate && !isValidIsoDate(purchaseDate))
      newErrors.purchaseDate = 'Fecha de compra no válida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para editar un artículo.');
      return;
    }
    setLoading(true);
    try {
      const payload: ArticlePayload = {
        title:         title.trim(),
        description:   description.trim(),
        city:          city.trim(),
        pricePerMonth: Number(pricePerMonth),
        availableFrom,
        availableUntil,
        category:      { id: category!.id } as any,
        ...(imageUrl.trim()     && { imageUrl:     imageUrl.trim() }),
        ...(condition           && { condition:    condition as ArticleCondition }),
        ...(purchaseDate.trim() && { purchaseDate: purchaseDate.trim() }),
      };
      await updateArticle(article.id, user.id, user.token, payload);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo actualizar el artículo');
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
          <Text style={styles.headerTitle}>Editar artículo</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>
            <Field
              label="Título"
              value={title}
              onChange={(t) => { setTitle(t); clearError('title'); }}
              placeholder="Ej: Taladro percutor Bosch"
              error={errors.title}
            />
            <Field
              label="Descripción"
              value={description}
              onChange={(t) => { setDescription(t); clearError('description'); }}
              placeholder="Describe el estado, accesorios incluidos..."
              multiline
              error={errors.description}
            />
            <Field
              label="Ciudad"
              value={city}
              onChange={(t) => { setCity(t); clearError('city'); }}
              placeholder="Ej: Madrid"
              error={errors.city}
            />
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
                <Text style={[styles.categorySelectorText, !category && { color: Colors.textSecondary }]}>
                  {category ? category.name : 'Selecciona una categoría'}
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
                      category?.id === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setCategoryOpen(false);
                      clearError('category');
                      clearError('pricePerMonth');
                    }}
                  >
                    <Text style={[styles.categoryOptionText, category?.id === cat.id && styles.categoryOptionTextSelected]}>
                      {cat.name}
                    </Text>
                    {category?.id === cat.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {categoryOpen && dbCategories.length === 0 && !loadingCategories && (
              <View style={[styles.categoryDropdown, { padding: Spacing.md }]}>
                <Text style={commonStyles.bodySecondary}>No hay categorías disponibles.</Text>
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
              placeholder="Ej: 25.00"
              keyboardType="numeric"
              error={errors.pricePerMonth}
            />
            {category && (
              <Text style={styles.helperText}>
                Precio entre {category.minPrice}€ y {category.maxPrice}€
              </Text>
            )}

            {/* Selector de rango de fechas */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Periodo de disponibilidad</Text>
              <TouchableOpacity
                style={[
                  commonStyles.input,
                  styles.dateSelector,
                  (errors.availableFrom || errors.availableUntil) ? commonStyles.inputError : null,
                ]}
                onPress={() => setShowDateRangePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dateSelectorText,
                  !(availableFrom && availableUntil) && { color: Colors.textSecondary },
                ]}>
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
            <Field
              label="URL de imagen"
              value={imageUrl}
              onChange={(t) => { setImageUrl(t); clearError('imageUrl'); }}
              placeholder="https://..."
              optional
              error={errors.imageUrl}
            />

            {/* RN-ART-23: estado de conservación */}
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

            {/* Fecha de compra con calendario */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Fecha de compra</Text>
                <Text style={styles.optional}> (opcional)</Text>
              </View>
              <TouchableOpacity
                style={[
                  commonStyles.input,
                  styles.dateSelector,
                  errors.purchaseDate ? commonStyles.inputError : null,
                ]}
                onPress={() => setShowPurchaseDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dateSelectorText,
                  !purchaseDate && { color: Colors.textSecondary },
                ]}>
                  {purchaseDate ? toDisplay(purchaseDate) : 'Selecciona la fecha de compra'}
                </Text>
                <View style={styles.dateRightIcons}>
                  {purchaseDate && (
                    <TouchableOpacity
                      onPress={() => {
                        setPurchaseDate('');
                        setPurchaseDateObj(undefined);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
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
                <Ionicons name="save-outline" size={20} color={Colors.textWhite} />
                <Text style={[commonStyles.primaryButtonText, { marginLeft: Spacing.sm }]}>
                  Guardar cambios
                </Text>
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
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
  },
  optional: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  textarea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  dateRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
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
    backgroundColor: Colors.background,
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

export default EditArticleScreen;