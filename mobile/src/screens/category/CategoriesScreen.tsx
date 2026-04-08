import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Category, RootStackParamList } from "../../types";
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
} from "../../components";

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
  const token = (user as any)?.token || "";

  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [token]),
  );

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
      Alert.alert("Error", `No se pudieron cargar: ${errorMessage}`);
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

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    const performDelete = async () => {
      try {
        await deleteCategory(categoryId, token);
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      } catch (error) {
        if (Platform.OS === "web") {
          window.alert("Error: No se pudo eliminar la categoría.");
        } else {
          Alert.alert("Error", "No se pudo eliminar la categoría.");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        `¿Deseas eliminar la categoría "${categoryName}"?`,
      );
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Eliminar categoría",
        `¿Deseas eliminar la categoría "${categoryName}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: performDelete },
        ],
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
              onPress={() => handleDeleteCategory(item.id, item.name)}
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
      <Header
        title="Gestión de categorías"
        showBack={true}
        onBack={() => navigation.goBack()}
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
            style={{ marginTop: 20 }}
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
