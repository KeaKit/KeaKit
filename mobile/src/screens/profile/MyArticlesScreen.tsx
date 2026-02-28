import React, { useState, useEffect } from 'react';
import {View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyArticles } from '../../services/articleService';
import { Article, RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';

type MyArticlesNav = NativeStackNavigationProp<RootStackParamList, 'MyArticles'>;

type FilterType = 'ALL' | 'AVAILABLE' | 'RENTED';

const MyArticlesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyArticlesNav>();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    const loadArticles = async () => {
      if (!user) {
        setError('Debes iniciar sesión para ver tus artículos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMyArticles(user.id, user.token);
        setArticles(data);
        setFilteredArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar artículos');
        console.error('Error cargando artículos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [user]);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredArticles(articles);
    } else if (filter === 'AVAILABLE') {
      setFilteredArticles(articles.filter(a => a.status === 'AVAILABLE'));
    } else if (filter === 'RENTED') {
      setFilteredArticles(articles.filter(a => a.status === 'RENTED'));
    }
  }, [filter, articles]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return '#28a745';
      case 'RENTED': return '#ffc107';
      case 'INACTIVE': return '#6c757d';
      default: return '#999';
    }
  };

  const translateStatus = (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'RENTED': return 'Alquilado';
      case 'INACTIVE': return 'Inactivo';
      default: return status;
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <View style={styles.articleCard}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>

      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.primary} />
          <Text style={styles.articlePrice}>
            €{item.pricePerMonth.toFixed(2)}/mes
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {translateStatus(item.status)}
            </Text>
          </View>
        </View>

        {item.status === 'RENTED' && item.rentedUntil && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              Hasta: {formatDate(item.rentedUntil)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando artículos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mis Artículos</Text>
        
        <View style={styles.headerRight} />
      </View>

ç      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ALL' && styles.filterButtonActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            Todos ({articles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'AVAILABLE' && styles.filterButtonActive]}
          onPress={() => setFilter('AVAILABLE')}
        >
          <Text style={[styles.filterText, filter === 'AVAILABLE' && styles.filterTextActive]}>
            Disponibles ({articles.filter(a => a.status === 'AVAILABLE').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'RENTED' && styles.filterButtonActive]}
          onPress={() => setFilter('RENTED')}
        >
          <Text style={[styles.filterText, filter === 'RENTED' && styles.filterTextActive]}>
            Alquilados ({articles.filter(a => a.status === 'RENTED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'ALL' 
              ? 'No tienes artículos subidos'
              : `No tienes artículos ${filter === 'AVAILABLE' ? 'disponibles' : 'alquilados'}`
            }
          </Text>
          <Text style={styles.emptySubtext}>
            Comienza subiendo tu primer artículo para alquilar
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: Spacing.md,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  articlePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

export default MyArticlesScreen;
