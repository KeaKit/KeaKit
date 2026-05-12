import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthUser, Category, RootStackParamList } from "../../types";
import { useAuth } from "../../context/AuthContext";

import {
  fetchAllCategories,
  deleteCategory,
  fetchArticleCountByCategory,
} from "../../services/categoryService";

import { Colors, commonStyles } from "../../styles";
import { categoriesScreenStyles } from "../../styles/categoriesScreenStyles";
import {
  Header,
  KeakitButton,
  KeakitCRUDButton,
  KeakitTag,
  KeakitSearchBar,
  KeakitModal,
} from "../../components";
import { Helmet } from 'react-helmet-async'; 

const { categoryCard, cardLeft, categoryName, cardRight, buttonsArea } =
  categoriesScreenStyles;

type CategoriesNav = NativeStackNavigationProp<
  RootStackParamList,
  "Categories"
>;

interface CategoryWithCount extends Category {
  articleCount: number;
}

export default function CategoriesScreen() {
  const navigation = useNavigation<CategoriesNav>();
  const { user } = useAuth();
  const token = (user as AuthUser)?.token || "";

  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    categoryName: string;
    categoryId: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [token]),
  );

  useEffect(() => {
    // Al cerrar el modal de eliminación, se limpia la categoría después de un breve retraso
    // Con la animación se veía el nombre de la categoría "undefined" por un instante
    if (!deleteModalVisible) {
      const timer = setTimeout(() => {
        setCategoryToDelete(null);
      }, 300);
      return () => { clearTimeout(timer) }
    }
  }, [deleteModalVisible]);

  const loadCategories: () => Promise<void> = async () => {
    setIsLoading(true);
    if (!token) return setIsLoading(false);

    try {
      const data = await fetchAllCategories(token);

      const categoriesWithCounts = await Promise.all(
        data.map(async (cat) => {
          try {
            const count = await fetchArticleCountByCategory(cat.id, token);
            return { ...cat, articleCount: count };
          } catch (error) {
            console.warn(
              `Error obteniendo contador para la categoría ${cat.id}`,
            );
            return { ...cat, articleCount: 0 };
          }
        }),
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setErrorModalVisible(true);
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCategory = (category: CategoryWithCount) => {
    navigation.navigate("CategoryForm", { category, mode: "view" });
  };

  const handleCreateCategory = () => {
    navigation.navigate("CategoryForm", {
      category: undefined,
      mode: "create",
    });
  };

  const handleEditCategory = (category: CategoryWithCount) => {
    navigation.navigate("CategoryForm", { category, mode: "edit" });
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId, token);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      setErrorModalVisible(true);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setErrorMessage(errorMessage);
    } finally {
      loadCategories();
    }
  };

  const renderCategoryItem = ({ item }: { item: CategoryWithCount }) => (
    <TouchableOpacity
      style={categoryCard}
      activeOpacity={0.7}
      onPress={() => handleViewCategory(item)}
    >
      <View style={cardLeft}>
        <Text style={categoryName}>{item.name}</Text>
        <Text style={commonStyles.bodySecondary}>
          {item.articleCount} artículos publicados
        </Text>
      </View>

      <View style={cardRight}>
        <KeakitTag
          title={item.status === "ACTIVE" ? "Activo" : "Borrador"}
          color={item.status === "ACTIVE" ? Colors.success : Colors.warning}
        />

        <View style={buttonsArea}>
          <KeakitCRUDButton
            type="edit"
            onPress={() => handleEditCategory(item)}
          />

          {item.articleCount === 0 && (
            <KeakitCRUDButton
              type="delete"
              onPress={() => {
                setCategoryToDelete({
                  categoryName: item.name,
                  categoryId: item.id,
                });
                setDeleteModalVisible(true);
              }}
              variant="violet"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Categorías | KeaKit</title>
        <meta name="description" content="Administra las categorías de artículos de KeaKit: crea, edita y organiza el contenido de la plataforma."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>     
      <Header
        title="Gestión de categorías"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <KeakitModal
        visible={errorModalVisible}
        onDismiss={() => {
          setErrorModalVisible(false);
          setErrorMessage("");
          navigation.goBack();
        }}
        message={`No se pudieron cargar las categorías: ${errorMessage}`}
        variant="error"
      />

      <KeakitModal
        visible={deleteModalVisible}
        onDismiss={() => {
          setDeleteModalVisible(false);
        }}
        onConfirm={async () => {
          if (categoryToDelete) {
            await handleDeleteCategory(categoryToDelete.categoryId);
          }
        }}
        message={`¿Deseas eliminar la categoría "${categoryToDelete?.categoryName}"?`}
        variant="confirmation"
      />

      <View style={commonStyles.contentContainer}>
        <KeakitSearchBar
          placeholder="Buscar categorías..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <KeakitButton
          title="Crear categoría"
          onPress={handleCreateCategory}
          icon="plus"
        />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 90,
            }}
          />
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
