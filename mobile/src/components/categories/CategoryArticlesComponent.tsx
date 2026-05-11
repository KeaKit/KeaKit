import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  useWindowDimensions,
} from "react-native";
import { Colors, Spacing, commonStyles } from "../../styles";
import { categoryFormScreenStyles } from "../../styles/categoryFormScreenStyles";
import { Category, UserArticle } from "../../types";
import {
  fetchArticleCountByCategory,
  fetchLatestArticlesByCategory,
} from "../../services/categoryService";
import { Icon } from "react-native-paper";

const {
  articleListContainer,
  articleListTitle,
  statCircle,
  statNumber,
  articleCard,
  articleImage,
  imagePlaceholder,
  articleInfo,
  articleTitle,
  articleBadge,
} = categoryFormScreenStyles;

export const CategoryArticlesComponent = ({
  category,
  token,
}: {
  category: Category;
  token: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [articleCount, setArticleCount] = useState(0);
  const [latestArticles, setLatestArticles] = useState<UserArticle[]>([]);
  const { width } = useWindowDimensions();

  const itemWidth = 140;
  const horizontalPadding = Spacing.lg * 2;
  const gapBetweenItems = Spacing.md;
  const availableWidth = width - horizontalPadding - Spacing.lg * 2;
  const numColumns = Math.max(
    2,
    Math.floor(availableWidth / (itemWidth + gapBetweenItems)),
  );
  const firstRowFull = latestArticles.length >= numColumns;

  useEffect(() => {
    const loadData = async () => {
      if (category.id) {
        await loadArticles(category.id);
      }
    };
    loadData();
  }, [category.id]);

  const loadArticles = async (categoryId: number) => {
    setLoading(true);
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
      setLoading(false);
    }
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
          <Icon source="image-outline" size={24} color={Colors.textLight} />
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
    <View style={articleListContainer}>
      <View style={articleListTitle}>
        <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>
          Últimos Artículos
        </Text>
        {!loading && articleCount > 0 && (
          <View style={statCircle}>
            <Text style={statNumber}>{articleCount}</Text>
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.primary}
          style={{ alignSelf: "flex-start", marginLeft: Spacing.md }}
        />
      ) : latestArticles.length > 0 ? (
        <FlatList
          key={`articles-grid-${numColumns}`}
          scrollEnabled={true}
          data={latestArticles}
          numColumns={numColumns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          columnWrapperStyle={{ gap: Spacing.md, marginBottom: Spacing.md }}
          contentContainerStyle={firstRowFull ? { alignSelf: "center" } : {}}
        />
      ) : (
        <Text style={[commonStyles.bodySecondary, { marginLeft: Spacing.sm }]}>
          Aún no hay artículos en esta categoría.
        </Text>
      )}
    </View>
  );
};
