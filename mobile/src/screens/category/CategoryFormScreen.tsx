import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Alert, ActivityIndicator,
  FlatList, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Category, UserArticle, RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  createCategory, 
  updateCategory,
  fetchArticleCountByCategory,
  fetchLatestArticlesByCategory 
} from '../../services/categoryService';

import { Colors, Spacing, commonStyles, FontSizes, FontWeights, BorderRadius } from '../../styles';
import { categoryFormScreenStyles } from '../../styles/categoryFormScreenStyles';
import { Helmet } from 'react-helmet-async'; 

const { scrollContent, formCard, inputRow, inputLabel,
    inlineInput, statusValue ,priceInput, priceSeparator, divider, cardFooter, statsContainer, statPill, statCircle, statNumber, statLabel
    ,saveButton, saveButtonText, editButton, articleCard, articleImage, imagePlaceholder, articleInfo, articleTitle, articleBadge, addIconSmall} = categoryFormScreenStyles;

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
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>(categoryToEdit?.status || 'DRAFT');
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

  const handlePriceChange = (text: string, setPrice: (value: string) => void) => {
      let val = text.replace(',', '.');
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
      }
      if (val.includes('.')) {
        const [integerPart, decimalPart] = val.split('.');
        if (decimalPart.length > 2) {
          val = `${integerPart}.${decimalPart.slice(0, 2)}`;
        }
      }
      const numericValue = parseFloat(val);
      if (!isNaN(numericValue) && numericValue > 1000000) {
        val = '1000000';
      }

      setPrice(val);
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
    <View style={articleCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={articleImage} resizeMode="cover" />
      ) : (
        <View style={[articleImage, imagePlaceholder]}>
          <Ionicons name="image-outline" size={24} color={Colors.textLight} />
        </View>
      )}
      <View style={articleInfo}>
        <View style={{ flex: 1, paddingRight: Spacing.xs }}>
          <Text style={articleTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={articleBadge}>
             {item.status === 'AVAILABLE' ? 'Disponible' : item.status === 'RENTED' ? 'Alquilado' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </View>
  );

  const isEditable = formMode !== 'view';

  const getMetaDescription = () => {
    if (formMode === 'view') {
      return 'Consulta los detalles, estado y artículos asociados a esta categoría en KeaKit.';
    }

    if (formMode === 'edit') {
      return 'Edita la información, estado y rango de precios de una categoría en KeaKit.';
    }

    return 'Crea una nueva categoría para organizar artículos dentro de la plataforma KeaKit.';
  };

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <Helmet>
        <title>{formMode === 'create' ? 'Crear Categoría' : formMode === 'edit' ? 'Editar Categoría' : 'Detalles de Categoría'} | KeaKit</title>
        <meta name="description" content={getMetaDescription()} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <View style={commonStyles.header}>
        <TouchableOpacity style={{ padding: Spacing.sm }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContent}>

        <View style={formCard}>
          <View style={inputRow}>
            <Text style={inputLabel}>Nombre: </Text>
            <TextInput
              style={[inlineInput, !isEditable && { color: Colors.textSecondary }]}
              placeholder="Ej. Electrónica"
              value={name}
              onChangeText={setName}
              editable={isEditable}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={divider} />

          <View style={inputRow}>
            <Text style={inputLabel}>Descripción: </Text>
            <TextInput
              style={[inlineInput, { flex: 1 }, !isEditable && { color: Colors.textSecondary }]}
              placeholder="Añade una descripción..."
              value={description}
              onChangeText={setDescription}
              multiline
              editable={isEditable}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={divider} />

          <View style={inputRow}>
            <Text style={inputLabel}>Estado: </Text>
            <TouchableOpacity onPress={toggleStatus} disabled={!isEditable}>
              <Text style={[
                statusValue, 
                { color: status === 'ACTIVE' ? Colors.success : Colors.warning },
                !isEditable && { opacity: 0.7 }
              ]}>
                {status === 'ACTIVE' ? 'Activo' : 'Borrador'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={divider} />

          <View style={inputRow}>
            <Text style={inputLabel}>Rango de precios: </Text>
            <TextInput
              style={[priceInput, !isEditable && { color: Colors.textSecondary }]}
              keyboardType="numeric"
              placeholder="Mín"
              value={minPrice}
              onChangeText={(text) => handlePriceChange(text, setMinPrice)}
              editable={isEditable}
            />
            <Text style={priceSeparator}>€  -  </Text>
            <TextInput
              style={[priceInput, !isEditable && { color: Colors.textSecondary }]}
              keyboardType="numeric"
              placeholder="Máx"
              value={maxPrice}
              onChangeText={(text) => handlePriceChange(text, setMaxPrice)}
              editable={isEditable}
            />
            <Text style={priceSeparator}>€</Text>
          </View>
          
          <View style={divider} />

          <View style={cardFooter}>
            <View style={statsContainer}>
              <View style={statPill}>
                <View style={statCircle}>
                  {isLoadingExtra ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={statNumber}>{articleCount}</Text>
                  )}
                </View>
                <Text style={statLabel}>Artículos publicados</Text>
              </View>
            </View>

            {formMode === 'view' ? (
              <TouchableOpacity 
                style={editButton} 
                onPress={() => setFormMode('edit')}
              >
                <Ionicons name="pencil" size={18} color={Colors.textWhite} style={{ marginRight: 6 }} />
                <Text style={saveButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={saveButton} 
                onPress={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <Text style={saveButtonText}>
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

export default CategoryFormScreen;