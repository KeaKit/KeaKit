import React, { useState } from 'react';
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
import { ArticlePayload, RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';

type EditNav   = NativeStackNavigationProp<RootStackParamList, 'EditArticle'>;
type EditRoute = RouteProp<RootStackParamList, 'EditArticle'>;

const CATEGORIES = [
  'Herramientas', 'Electrónica', 'Deportes', 'Hogar',
  'Jardinería', 'Música', 'Fotografía', 'Automoción', 'Otros',
];

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
  const [category,       setCategory]       = useState(article.category ?? '');
  const [imageUrl,       setImageUrl]       = useState(article.imageUrl ?? '');
  const [purchaseDate,   setPurchaseDate]   = useState(article.purchaseDate ?? '');

  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: '' }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!title.trim())       newErrors.title       = 'El título es obligatorio';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!city.trim())        newErrors.city        = 'La ciudad es obligatoria';
    if (!category)           newErrors.category    = 'Selecciona una categoría';

    if (!pricePerMonth || isNaN(Number(pricePerMonth)) || Number(pricePerMonth) <= 0)
      newErrors.pricePerMonth = 'Introduce un precio válido';

    if (!availableFrom || !dateRegex.test(availableFrom))
      newErrors.availableFrom = 'Formato: AAAA-MM-DD';

    if (!availableUntil || !dateRegex.test(availableUntil))
      newErrors.availableUntil = 'Formato: AAAA-MM-DD';

    if (availableFrom && availableUntil && availableFrom >= availableUntil)
      newErrors.availableUntil = 'Debe ser posterior a la fecha de inicio';

    if (purchaseDate && !dateRegex.test(purchaseDate))
      newErrors.purchaseDate = 'Formato: AAAA-MM-DD';

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
        category,
        ...(imageUrl.trim()     && { imageUrl:     imageUrl.trim() }),
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

  return (
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <Field label="Título" value={title}
            onChange={(t) => { setTitle(t); clearError('title'); }}
            placeholder="Ej: Taladro percutor Bosch" error={errors.title} />
          <Field label="Descripción" value={description}
            onChange={(t) => { setDescription(t); clearError('description'); }}
            placeholder="Describe el estado, accesorios incluidos..."
            multiline error={errors.description} />
          <Field label="Ciudad" value={city}
            onChange={(t) => { setCity(t); clearError('city'); }}
            placeholder="Ej: Madrid" error={errors.city} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <TouchableOpacity
            style={[commonStyles.input, styles.categorySelector, errors.category ? commonStyles.inputError : null]}
            onPress={() => setCategoryOpen((o) => !o)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categorySelectorText, !category && { color: Colors.textSecondary }]}>
              {category || 'Selecciona una categoría'}
            </Text>
            <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {!!errors.category && (
            <View style={commonStyles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color={Colors.error} />
              <Text style={commonStyles.errorText}>{errors.category}</Text>
            </View>
          )}
          {categoryOpen && (
            <View style={styles.categoryDropdown}>
              {CATEGORIES.map((cat, index) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    index === CATEGORIES.length - 1 && { borderBottomWidth: 0 },
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => { setCategory(cat); setCategoryOpen(false); clearError('category'); }}
                >
                  <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextSelected]}>
                    {cat}
                  </Text>
                  {category === cat && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y disponibilidad</Text>
          <Field label="Precio por mes (€)" value={pricePerMonth}
            onChange={(t) => { setPricePerMonth(t); clearError('pricePerMonth'); }}
            placeholder="Ej: 25.00" keyboardType="numeric" error={errors.pricePerMonth} />
          <Field label="Disponible desde" value={availableFrom}
            onChange={(t) => { setAvailableFrom(t); clearError('availableFrom'); }}
            placeholder="AAAA-MM-DD" error={errors.availableFrom} />
          <Field label="Disponible hasta" value={availableUntil}
            onChange={(t) => { setAvailableUntil(t); clearError('availableUntil'); }}
            placeholder="AAAA-MM-DD" error={errors.availableUntil} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información adicional</Text>
          <Field label="URL de imagen" value={imageUrl}
            onChange={(t) => { setImageUrl(t); clearError('imageUrl'); }}
            placeholder="https://..." optional error={errors.imageUrl} />
          <Field label="Fecha de compra" value={purchaseDate}
            onChange={(t) => { setPurchaseDate(t); clearError('purchaseDate'); }}
            placeholder="AAAA-MM-DD" optional error={errors.purchaseDate} />
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
  );
};

const styles = StyleSheet.create({
  headerTitle:               { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  scrollContent:             { padding: Spacing.lg, gap: Spacing.xl },
  section:                   { gap: Spacing.md },
  sectionTitle:              { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  fieldContainer:            { gap: Spacing.xs },
  labelRow:                  { flexDirection: 'row', alignItems: 'center' },
  label:                     { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  optional:                  { fontSize: 13, color: Colors.textSecondary },
  textarea:                  { height: 100, paddingTop: Spacing.md },
  categorySelector:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorySelectorText:      { fontSize: 15, color: Colors.textPrimary },
  categoryDropdown:          { backgroundColor: Colors.backgroundWhite, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  categoryOption:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryOptionSelected:    { backgroundColor: Colors.primary + '12' },
  categoryOptionText:        { fontSize: 15, color: Colors.textPrimary },
  categoryOptionTextSelected:{ fontWeight: '700', color: Colors.primary },
  submitContent:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled:            { opacity: 0.6 },
});

export default EditArticleScreen;