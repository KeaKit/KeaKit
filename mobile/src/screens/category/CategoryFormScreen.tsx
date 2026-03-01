import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Alert, ActivityIndicator,
  FlatList, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AÑADIDO: Importamos UserArticle
import { Category, UserArticle, RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

// AÑADIDO: Importamos las nuevas funciones del servicio
import { 
  createCategory, 
  updateCategory,
  fetchArticleCountByCategory,
  fetchLatestArticlesByCategory 
} from '../../services/categoryService';

import { Colors, Spacing, commonStyles, FontSizes, FontWeights, BorderRadius } from '../../styles';

type CategoryFormNav = NativeStackNavigationProp<RootStackParamList, 'CategoryForm'>;
type CategoryFormRoute = RouteProp<RootStackParamList, 'CategoryForm'>;

const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation<CategoryFormNav>();
  const route = useRoute<CategoryFormRoute>();
  const { user } = useAuth();
  const token = (user as any)?.token || '';

  const categoryToEdit = route.params?.category;
  
  const initialMode = route.params?.mode || 'create';
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>(initialMode);

  const [name, setName] = useState(categoryToEdit?.name || '');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>(categoryToEdit?.status || 'ACTIVE');
  const [minPrice, setMinPrice] = useState(categoryToEdit?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(categoryToEdit?.maxPrice?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const [articleCount, setArticleCount] = useState<number>(0);
  const [latestArticles, setLatestArticles] = useState<UserArticle[]>([]);
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);

  useEffect(() => {
    if (categoryToEdit?.id) {
      loadExtraData(categoryToEdit.id);
    }
  }, [categoryToEdit?.id]);

  const loadExtraData = async (categoryId: number) => {
    setIsLoadingExtra(true);
    try {
      const [count, articles] = await Promise.all([
        fetchArticleCountByCategory(categoryId, token),
        fetchLatestArticlesByCategory(categoryId, token)
      ]);
      setArticleCount(count);
      setLatestArticles(articles);
    } catch (error) {
      console.warn('No se pudieron cargar los detalles extra', error);
    } finally {
      setIsLoadingExtra(false);
    }
  };

  const getHeaderTitle = () => {
    if (formMode === 'view') return 'Detalles de categoría';
    if (formMode === 'edit') return 'Editar categoría';
    return 'Crear categoría';
  };

  const handleSave = async () => {
    if (!name || !description || !minPrice || !maxPrice) {
      const msg = 'Error: Por favor rellena todos los campos.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Category> = {
        name, description, status,
        minPrice: parseFloat(minPrice), maxPrice: parseFloat(maxPrice),
      };

      const successMessage = formMode === 'edit' ? 'Categoría actualizada' : 'Categoría creada';

      if (formMode === 'edit' && categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload, token);
      } else {
        await createCategory(payload, token);
      }

      if (Platform.OS === 'web') {
        window.alert(successMessage);
        navigation.goBack(); 
      } else {
        Alert.alert('Éxito', successMessage, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Platform.OS === 'web' ? window.alert(errorMessage) : Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = () => {
    if (formMode === 'view') return;
    setStatus(prev => prev === 'ACTIVE' ? 'DRAFT' : 'ACTIVE');
  };

  // NUEVO: Renderizado adaptado a los datos reales de 'UserArticle'
  const renderArticle = ({ item }: { item: UserArticle }) => (
    <View style={styles.articleCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.articleImage} resizeMode="cover" />
      ) : (
        <View style={[styles.articleImage, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={24} color={Colors.textLight} />
        </View>
      )}
      <View style={styles.articleInfo}>
        <View style={{ flex: 1, paddingRight: Spacing.xs }}>
          <Text style={styles.articleTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.articleBadge}>
             {item.status === 'AVAILABLE' ? 'Disponible' : item.status === 'RENTED' ? 'Alquilado' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </View>
  );

  const isEditable = formMode !== 'view';

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={{ padding: Spacing.sm }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nombre: </Text>
            <TextInput
              style={[styles.inlineInput, !isEditable && { color: Colors.textSecondary }]}
              placeholder="Ej. Electrónica"
              value={name}
              onChangeText={setName}
              editable={isEditable}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Descripción: </Text>
            <TextInput
              style={[styles.inlineInput, { flex: 1 }, !isEditable && { color: Colors.textSecondary }]}
              placeholder="Añade una descripción..."
              value={description}
              onChangeText={setDescription}
              multiline
              editable={isEditable}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Estado: </Text>
            <TouchableOpacity onPress={toggleStatus} disabled={!isEditable}>
              <Text style={[
                styles.statusValue, 
                { color: status === 'ACTIVE' ? Colors.success : Colors.warning },
                !isEditable && { opacity: 0.7 }
              ]}>
                {status === 'ACTIVE' ? 'Activo' : 'Borrador'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Rango de precios: </Text>
            <TextInput
              style={[styles.priceInput, !isEditable && { color: Colors.textSecondary }]}
              keyboardType="numeric"
              placeholder="Mín"
              value={minPrice}
              onChangeText={setMinPrice}
              editable={isEditable}
            />
            <Text style={styles.priceSeparator}>€  -  </Text>
            <TextInput
              style={[styles.priceInput, !isEditable && { color: Colors.textSecondary }]}
              keyboardType="numeric"
              placeholder="Máx"
              value={maxPrice}
              onChangeText={setMaxPrice}
              editable={isEditable}
            />
            <Text style={styles.priceSeparator}>€</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.cardFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.statPill}>
                <View style={styles.statCircle}>
                  {isLoadingExtra ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.statNumber}>{articleCount}</Text>
                  )}
                </View>
                <Text style={styles.statLabel}>Artículos publicados</Text>
              </View>
            </View>

            {formMode === 'view' ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setFormMode('edit')}
              >
                <Ionicons name="pencil" size={18} color={Colors.textWhite} style={{ marginRight: 6 }} />
                <Text style={styles.saveButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {formMode === 'edit' ? 'Confirmar cambios' : 'Crear categoría'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[commonStyles.title, { marginTop: Spacing.lg, marginBottom: Spacing.md, fontSize: 20 }]}>
          Últimos artículos
        </Text>
        
        {isLoadingExtra ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: 'flex-start', marginLeft: Spacing.md }} />
        ) : latestArticles.length > 0 ? (
          <FlatList
            horizontal
            data={latestArticles}
            keyExtractor={item => item.id.toString()}
            renderItem={renderArticle}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
          />
        ) : (
          <Text style={[commonStyles.bodySecondary, { marginLeft: Spacing.sm }]}>
            Aún no hay artículos en esta categoría.
          </Text>
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  formCard: { backgroundColor: Colors.backgroundWhite, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.shadowColor || '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  inputLabel: { fontSize: FontSizes.base, color: Colors.textPrimary, fontWeight: FontWeights.bold },
  inlineInput: { flex: 1, fontSize: FontSizes.base, color: Colors.textPrimary, paddingVertical: 0, marginLeft: 4 },
  statusValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, marginLeft: 4 },
  priceInput: { fontSize: FontSizes.base, color: Colors.textPrimary, fontWeight: FontWeights.bold, paddingVertical: 0, minWidth: 30, textAlign: 'center' },
  priceSeparator: { fontSize: FontSizes.base, color: Colors.textPrimary, fontWeight: FontWeights.bold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.sm },
  statsContainer: { gap: Spacing.sm },
  statPill: { flexDirection: 'row', alignItems: 'center' },
  statCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  statNumber: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  saveButton: { backgroundColor: Colors.primaryDark || Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: Colors.textWhite, fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  editButton: { flexDirection: 'row', backgroundColor: Colors.primaryLight || Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  articleCard: { width: 140, backgroundColor: Colors.backgroundWhite, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  articleImage: { width: '100%', height: 90, borderRadius: BorderRadius.md, backgroundColor: Colors.borderLight, marginBottom: Spacing.sm },
  
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  
  articleInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  articleTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  articleBadge: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  addIconSmall: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
});

export default CategoryFormScreen;