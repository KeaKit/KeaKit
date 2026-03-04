import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { 
  AlertCircle, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Image as ImageIcon, 
  Images, 
  Camera, 
  XCircle, 
  CloudUpload 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { uploadArticle, uploadArticleWithImage } from '../../services/articleService';
import { fetchAllCategories } from '../../services/categoryService';
import { ArticlePayload, RootStackParamList, Category } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';

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
        <AlertCircle size={14} color={Colors.error} />
        <Text style={commonStyles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

const UploadArticleScreen: React.FC = () => {
  const navigation = useNavigation<UploadNav>();
  const { user } = useAuth();
  const token = (user as any)?.token || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string } | null>(null);
  const [purchaseDate, setPurchaseDate] = useState('');

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
        const activeCategories = data.filter(c => c.status === 'ACTIVE');
        setDbCategories(activeCategories);
      } catch (err) {
        Alert.alert('Aviso', 'No se pudieron cargar las categorías del servidor.');
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        setSelectedImage({ uri: asset.uri, name: fileName });
        clearError('image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara para tomar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `photo_${Date.now()}.jpg`;
        setSelectedImage({ uri: asset.uri, name: fileName });
        clearError('image');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: '' }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!title.trim())       newErrors.title       = 'El título es obligatorio';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!city.trim())        newErrors.city        = 'La ciudad es obligatoria';
    if (!selectedCategory)   newErrors.category    = 'Selecciona una categoría';

    if (!pricePerMonth || isNaN(Number(pricePerMonth)) || Number(pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Introduce un precio válido';
    } else if (selectedCategory) {
      const price = Number(pricePerMonth);
      if (price < selectedCategory.minPrice || price > selectedCategory.maxPrice) {
         newErrors.pricePerMonth = `El precio debe estar entre ${selectedCategory.minPrice}€ y ${selectedCategory.maxPrice}€ para esta categoría`;
      }
    }

    if (!availableFrom || !dateRegex.test(availableFrom))
      newErrors.availableFrom = 'Formato: AAAA-MM-DD';

    if (!availableUntil || !dateRegex.test(availableUntil))
      newErrors.availableUntil = 'Formato: AAAA-MM-DD';

    if(availableFrom < Date.now().toString().slice(0,10)) {
      newErrors.availableFrom = 'La fecha de inicio no puede ser anterior a hoy';
    }

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
      Alert.alert('Error', 'Debes estar autenticado para subir un artículo.');
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
        category:      { id: selectedCategory!.id } as any, 
        status:        'AVAILABLE',
        ...(purchaseDate.trim() && { purchaseDate: purchaseDate.trim() }),
      };

      if (selectedImage) {
        await uploadArticleWithImage(user.id, selectedCategory!.id, user.token, payload, selectedImage.uri, selectedImage.name);
      } else {
        // En teoría validation previene caer aquí, pero como fallback
        await uploadArticle(user.id, selectedCategory!.id, user.token, payload);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo subir el artículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo artículo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <Field label="Título" value={title} onChange={(t) => { setTitle(t); clearError('title'); }} placeholder="Ej: Taladro percutor Bosch" error={errors.title} />
          <Field label="Descripción" value={description} onChange={(t) => { setDescription(t); clearError('description'); }} placeholder="Describe el estado, accesorios incluidos..." multiline error={errors.description} />
          <Field label="Ciudad" value={city} onChange={(t) => { setCity(t); clearError('city'); }} placeholder="Ej: Madrid" error={errors.city} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <TouchableOpacity
            style={[
              commonStyles.input,
              styles.categorySelector,
              errors.category ? commonStyles.inputError : null,
            ]}
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
            {categoryOpen ? <ChevronUp size={20} color={Colors.textSecondary} /> : <ChevronDown size={20} color={Colors.textSecondary} />}
          </TouchableOpacity>
          {!!errors.category && (
            <View style={commonStyles.errorContainer}>
              <AlertCircle size={14} color={Colors.error} />
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
                  {selectedCategory?.id === cat.id && (
                    <Check size={18} color={Colors.primary} />
                  )}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y disponibilidad</Text>
          <Field label="Precio por mes (€)" value={pricePerMonth} onChange={(t) => { setPricePerMonth(t); clearError('pricePerMonth'); }} placeholder="Ej: 25.00" keyboardType="numeric" error={errors.pricePerMonth} />
          {selectedCategory && (
            <Text style={styles.helperText}>
              El precio debe estar entre {selectedCategory.minPrice}€ y {selectedCategory.maxPrice}€.
            </Text>
          )}
          <Field label="Disponible desde" value={availableFrom} onChange={(t) => { setAvailableFrom(t); clearError('availableFrom'); }} placeholder="AAAA-MM-DD" error={errors.availableFrom} />
          <Field label="Disponible hasta" value={availableUntil} onChange={(t) => { setAvailableUntil(t); clearError('availableUntil'); }} placeholder="AAAA-MM-DD" error={errors.availableUntil} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información adicional</Text>
          
          <Text style={styles.label}>Foto del artículo (opcional)</Text>
          <View style={styles.imageSelectorContainer}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <XCircle size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, errors.image ? { borderColor: Colors.error } : null]}>
                <ImageIcon size={40} color={Colors.textSecondary} />
                <Text style={styles.placeholderText}>Sube una foto de tu artículo</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Images size={20} color={Colors.primary} />
                <Text style={styles.imageButtonText}>Galería</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imageButton} onPress={takePicture}>
                <Camera size={20} color={Colors.primary} />
                <Text style={styles.imageButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>
            {!!errors.image && (
              <View style={[commonStyles.errorContainer, { marginTop: Spacing.xs }]}>
                <AlertCircle size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.image}</Text>
              </View>
            )}
          </View>

          <Field label="Fecha de compra" value={purchaseDate} onChange={(t) => { setPurchaseDate(t); clearError('purchaseDate'); }} placeholder="AAAA-MM-DD" optional error={errors.purchaseDate} />
        </View>

        <TouchableOpacity style={[commonStyles.primaryButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <View style={styles.submitContent}>
              <CloudUpload size={20} color={Colors.textWhite} />
              <Text style={[commonStyles.primaryButtonText, { marginLeft: Spacing.sm }]}>Publicar artículo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  scrollContent: { padding: Spacing.lg, gap: Spacing.xl },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  fieldContainer: { gap: Spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  optional: { fontSize: 13, color: Colors.textSecondary },
  textarea: { height: 100, paddingTop: Spacing.md },
  categorySelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorySelectorText: { fontSize: 15, color: Colors.textPrimary },
  categoryDropdown: { backgroundColor: Colors.backgroundWhite, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  categoryOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryOptionSelected: { backgroundColor: Colors.primary + '12' },
  categoryOptionText: { fontSize: 15, color: Colors.textPrimary },
  categoryOptionTextSelected: { fontWeight: '700', color: Colors.primary },
  submitContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  
  helperText: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', marginTop: -4 },

  imageSelectorContainer: { gap: Spacing.sm },
  selectedImageContainer: { position: 'relative', height: 250, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.sm, backgroundColor: Colors.border },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'contain' },
  changeImageButton: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.backgroundWhite, borderRadius: 12 },
  imagePlaceholder: { height: 180, width: '100%', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  placeholderText: { color: Colors.textSecondary, fontSize: 14, marginTop: Spacing.sm },
  buttonRow: { flexDirection: 'row', gap: Spacing.md },
  imageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderRadius: 8, backgroundColor: Colors.border, borderWidth: 1, borderColor: Colors.primary },
  imageButtonText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});

export default UploadArticleScreen;