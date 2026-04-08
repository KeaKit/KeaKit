import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserArticle, RootStackParamList } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  fetchArticleCountByCategory,
  fetchLatestArticlesByCategory,
} from "../../services/categoryService";

import { Colors, Spacing, commonStyles } from "../../styles";
import { categoryFormScreenStyles } from "../../styles/categoryFormScreenStyles";
import {
  Header,
  CategoryFormComponent,
  CategoryDetailsComponent,
} from "../../components";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: "#E3F2FD",
    onPrimaryContainer: Colors.primary,
    surface: "#FFFFFF",
    onSurface: "#1C1B1F",
    surfaceVariant: "#E7E0EC",
    onSurfaceVariant: "#49454F",
    secondaryContainer: "#E3F2FD",
    onSecondaryContainer: Colors.primary,
    outline: Colors.border,
    outlineVariant: Colors.success,
  },
};
const {
  articleCard,
  articleImage,
  imagePlaceholder,
  articleInfo,
  articleTitle,
  articleBadge,
  statCircle,
  statNumber,
} = categoryFormScreenStyles;

type CategoryFormNav = NativeStackNavigationProp<
  RootStackParamList,
  "CategoryForm"
>;
type CategoryFormRoute = RouteProp<RootStackParamList, "CategoryForm">;

export default function CategoryDetailsScreen() {
  const route = useRoute<CategoryFormRoute>();
  const categoryToEdit = route.params?.category;
  const initialMode = route.params?.mode || "create";
  const [formMode, setFormMode] = useState<"view" | "edit" | "create">(
    initialMode,
  );
  const isEditable = formMode !== "view";

  const navigation = useNavigation<CategoryFormNav>();

  const { user } = useAuth();
  const token = (user as any)?.token || "";

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
        fetchLatestArticlesByCategory(categoryId, token),
      ]);
      setArticleCount(count);
      setLatestArticles(articles);
    } catch (error) {
      console.warn("No se pudieron cargar los detalles extra", error);
    } finally {
      setIsLoadingExtra(false);
    }
  };

  const getHeaderTitle = () => {
    if (formMode === "view") return "Detalles de categoría";
    if (formMode === "edit") return "Editar categoría";
    return "Crear categoría";
  };

  

  const renderArticle = ({ item }: { item: UserArticle }) => (
    <View style={articleCard}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={articleImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[articleImage, imagePlaceholder]}>
          <Ionicons name="image-outline" size={24} color={Colors.textLight} />
        </View>
      )}
      <View style={articleInfo}>
        <View style={{ flex: 1, paddingRight: Spacing.xs }}>
          <Text style={articleTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={articleBadge}>
            {item.status === "AVAILABLE"
              ? "Disponible"
              : item.status === "RENTED"
                ? "Alquilado"
                : "Inactivo"}
          </Text>
        </View>
      </View>
    </View>
  );

  

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        <Header
          title={getHeaderTitle()}
          showBack={true}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={commonStyles.contentContainer}
        >
          {isEditable ? (
            <CategoryFormComponent
            categoryToEdit={categoryToEdit}
              formMode={formMode}
              navigation={navigation}
              token={token}
              
            />
          ) : (
            <CategoryDetailsComponent
              category={categoryToEdit!}
              setMode={setFormMode}
            />
          )}
          {formMode !== "create" && (
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                alignContent: "flex-start",
                gap: Spacing.md,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: Spacing.md,
                  alignItems: "center",
                }}
              >
                <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>
                  Últimos Artículos
                </Text>
                {!isLoadingExtra && articleCount > 0 && (
                  <View style={statCircle}>
                    <Text style={statNumber}>{articleCount}</Text>
                  </View>
                )}
              </View>

              {isLoadingExtra ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{ alignSelf: "flex-start", marginLeft: Spacing.md }}
                />
              ) : latestArticles.length > 0 ? (
                <>
                  <FlatList
                    horizontal
                    data={latestArticles}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderArticle}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: Spacing.xl }}
                  />
                </>
              ) : (
                <Text
                  style={[
                    commonStyles.bodySecondary,
                    { marginLeft: Spacing.sm },
                  ]}
                >
                  Aún no hay artículos en esta categoría.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}
