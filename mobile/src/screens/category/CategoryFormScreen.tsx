import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Alert, ActivityIndicator,
  FlatList, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Category, RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createCategory, updateCategory } from '../../services/categoryService';
import { Colors, Spacing, commonStyles, FontSizes, FontWeights, BorderRadius } from '../../styles';

type CategoryFormNav = NativeStackNavigationProp<RootStackParamList, 'CategoryForm'>;
type CategoryFormRoute = RouteProp<RootStackParamList, 'CategoryForm'>;

const MOCK_ARTICLES = [
  { id: '1', title: 'Monitor 24"', badge: 'Nuevo', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Teclado Mecánico', badge: 'Nuevo', image: 'https://via.placeholder.com/150' },
];

const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation<CategoryFormNav>();
  const route = useRoute<CategoryFormRoute>();
  const { user } = useAuth();
  const token = (user as any)?.token || '';

  const categoryToEdit = route.params?.category;
  
  // NUEVO: Estado para controlar el modo de la pantalla
  const initialMode = route.params?.mode || 'create';
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>(initialMode);

  const [name, setName] = useState(categoryToEdit?.name || '');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>(categoryToEdit?.status || 'ACTIVE');
  const [minPrice, setMinPrice] = useState(categoryToEdit?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(categoryToEdit?.maxPrice?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  // Título dinámico para el Header
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
    if (formMode === 'view') return; // Bloquear toggle si es solo vista
    setStatus(prev => prev === 'ACTIVE' ? 'DRAFT' : 'ACTIVE');
  };

  const renderArticle = ({ item }: { item: typeof MOCK_ARTICLES[0] }) => (
    <View style={styles.articleCard}>
      <Image source={{ uri: item.image }} style={styles.articleImage} />
      <View style={styles.articleInfo}>
        <View>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleBadge}>{item.badge}</Text>
        </View>
        <TouchableOpacity style={styles.addIconSmall}>
          <Ionicons name="add" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Booleano para saber si se puede editar o no (false en modo 'view')
  const isEditable = formMode !== 'view';

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={{ padding: Spacing.sm }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        {/* Título dinámico */}
        <Text style={commonStyles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.formCard}>
          {/* Nombre */}
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

          {/* Descripción */}
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

          {/* Estado */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Estado: </Text>
            <TouchableOpacity onPress={toggleStatus} disabled={!isEditable}>
              <Text style={[
                styles.statusValue, 
                { color: status === 'ACTIVE' ? Colors.success : Colors.warning },
                !isEditable && { opacity: 0.7 } // Un poco más apagado en modo vista
              ]}>
                {status === 'ACTIVE' ? 'Activo' : 'Borrador'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {/* Rango de precios */}
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

          {/* Footer de la tarjeta */}
          <View style={styles.cardFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.statPill}>
                <View style={styles.statCircle}>
                  <Text style={styles.statNumber}>{categoryToEdit ? (categoryToEdit.articleCount || 0) : 0}</Text>
                </View>
                <Text style={styles.statLabel}>Artículos vendidos</Text>
              </View>

              <View style={styles.statPill}>
                <View style={styles.statCircle}>
                  <Text style={styles.statNumber}>10</Text>
                </View>
                <Text style={styles.statLabel}>Kits</Text>
              </View>
            </View>

            {/* Condicional para el Botón: Lapiz (Vista) vs Guardar (Creación/Edición) */}
            {formMode === 'view' ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setFormMode('edit')} // Cambiar a modo edición
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
        
        <FlatList
          horizontal
          data={MOCK_ARTICLES}
          keyExtractor={item => item.id}
          renderItem={renderArticle}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
        />
        
      </ScrollView>
    </SafeAreaView>
  );
};

// ... Mantén el resto de estilos exactamente igual, y añade este para el botón de editar
const styles = StyleSheet.create({
  // ... Copia aquí los que ya tenías ...
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
  
  // AÑADIDO: Estilo para el botón de editar en modo vista
  editButton: { 
    flexDirection: 'row', 
    backgroundColor: Colors.primaryLight || Colors.primary, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: BorderRadius.full, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  articleCard: { width: 140, backgroundColor: Colors.backgroundWhite, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  articleImage: { width: '100%', height: 90, borderRadius: BorderRadius.md, backgroundColor: Colors.borderLight, marginBottom: Spacing.sm },
  articleInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  articleTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  articleBadge: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  addIconSmall: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
});

export default CategoryFormScreen;