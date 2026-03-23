import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, TextInput, Alert, ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Category, RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

import { fetchAllCategories, deleteCategory, fetchArticleCountByCategory } from '../../services/categoryService';

import { Colors, Spacing, commonStyles, componentStyles, FontSizes, FontWeights, BorderRadius } from '../../styles';
import { categoriesScreenStyles } from '../../styles/categoriesScreenStyles';

const { roundedSearch, listContainer, categoryCard, cardLeft, categoryAvatar, categoryName, cardRight, statusText, fab } = categoriesScreenStyles;

type CategoriesNav = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

interface CategoryWithCount extends Category {
  articleCount: number;
}

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<CategoriesNav>();
  const { user } = useAuth();
  const token = (user as any)?.token || ''; 

  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [token])
  );

  const loadCategories = async () => {
    if (!token) return setIsLoading(false);
    setIsLoading(true);
    try {
      const data = await fetchAllCategories(token);
      
      const categoriesWithCounts = await Promise.all(
        data.map(async (cat) => {
          try {
            const count = await fetchArticleCountByCategory(cat.id, token);
            return { ...cat, articleCount: count };
          } catch (error) {
            console.warn(`Error obteniendo contador para la categoría ${cat.id}`);
            return { ...cat, articleCount: 0 }; 
          }
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudieron cargar: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCategory = (category: CategoryWithCount) => {
    navigation.navigate('CategoryForm', { category, mode: 'view' });
  };

  const handleCreateCategory = () => {
    navigation.navigate('CategoryForm', { category: undefined, mode: 'create' });
  };

  const handleEditCategory = (category: CategoryWithCount) => {
    navigation.navigate('CategoryForm', { category, mode: 'edit' });
  };

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    const performDelete = async () => {
      try {
        await deleteCategory(categoryId, token);
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Error: No se pudo eliminar la categoría.');
        } else {
          Alert.alert('Error', 'No se pudo eliminar la categoría.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`¿Deseas eliminar la categoría "${categoryName}"?`);
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Eliminar categoría',
        `¿Deseas eliminar la categoría "${categoryName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const renderCategoryItem = ({ item }: { item: CategoryWithCount }) => (
    <TouchableOpacity 
      style={categoryCard} 
      activeOpacity={0.7}
      onPress={() => handleViewCategory(item)} 
    >
      <View style={cardLeft}>
        <View style={categoryAvatar} />
        <View style={commonStyles.centerContent}>
          <Text style={categoryName}>{item.name}</Text>
          <Text style={commonStyles.bodySecondary}>{item.articleCount} artículos publicados</Text>
        </View>
      </View>

      <View style={cardRight}>
        <Text style={[statusText, { color: item.status === 'ACTIVE' ? Colors.success : Colors.warning }]}>
          {item.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
        </Text>
        
        <View style={commonStyles.errorContainer}>
          <TouchableOpacity 
            style={componentStyles.iconButton} 
            onPress={() => handleEditCategory(item)} 
          >
            <Ionicons name="pencil" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          {(item.articleCount === 0) && (
            <TouchableOpacity style={componentStyles.iconButton} onPress={() => handleDeleteCategory(item.id, item.name)}>
              <Ionicons name="trash" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Gestión de categorías</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[commonStyles.screenPadding, commonStyles.marginTopLg, { flex: 1 }]}>
        <View style={[componentStyles.searchBar, commonStyles.marginTopLg, commonStyles.marginBottomLg, roundedSearch]}>
          <Ionicons name="menu" size={24} color={Colors.textSecondary} />
          <TextInput
            style={componentStyles.searchInput}
            placeholder="Buscar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
          <Ionicons name="search" size={24} color={Colors.textSecondary} />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }}/>
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            contentContainerStyle={listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity style={fab} onPress={handleCreateCategory} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CategoriesScreen;