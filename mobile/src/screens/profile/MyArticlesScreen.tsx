import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Banknote, 
  Calendar, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Package, 
  Plus 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyArticles, deleteArticle, getArticleById } from '../../services/articleService';
import { RootStackParamList, UserArticle } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';

type MyArticlesNav = NativeStackNavigationProp<RootStackParamList, 'MyArticles'>;
type FilterType = 'ALL' | 'AVAILABLE' | 'RENTED';

const MyArticlesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyArticlesNav>();

  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
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
          setFilteredArticles(applyFilter(filter, data));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar artículos');
        } finally {
          setLoading(false);
        }
      };
      loadArticles();
    }, [user])
  );

  const applyFilter = (f: FilterType, data: UserArticle[]) => {
    if (f === 'AVAILABLE') return data.filter(a => a.status === 'AVAILABLE');
    if (f === 'RENTED')    return data.filter(a => a.status === 'RENTED');
    return data;
  };

  const handleFilter = (f: FilterType) => {
    setFilter(f);
    setFilteredArticles(applyFilter(f, articles));
  };

  const handleEdit = async (item: UserArticle) => {
    if (!user) return;
    try {
      const full = await getArticleById(item.id, user.token);
      navigation.navigate('EditArticle', { article: full });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cargar el artículo');
    }
  };

  const handleDelete = (item: UserArticle) => {
    if (item.status === 'RENTED') {
      window.alert('Este artículo está actualmente alquilado. Espera a que finalice el alquiler para eliminarlo.');
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${item.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    (async () => {
      if (!user) return;
      try {
        setDeletingId(item.id);
        await deleteArticle(item.id, user.id, user.token);
        const updated = articles.filter(a => a.id !== item.id);
        setArticles(updated);
        setFilteredArticles(applyFilter(filter, updated));
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'No se pudo eliminar el artículo');
      } finally {
        setDeletingId(null);
      }
    })();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return dateString; }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#28a745';
      case 'RENTED':    return '#ffc107';
      case 'INACTIVE':  return '#6c757d';
      default:          return '#999';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'RENTED':    return 'Alquilado';
      case 'INACTIVE':  return 'Inactivo';
      default:          return status;
    }
  };

  const getFilterLabel = (f: FilterType): string => {
    switch (f) {
      case 'ALL':       return `Todos (${articles.length})`;
      case 'AVAILABLE': return `Disponibles (${articles.filter(a => a.status === 'AVAILABLE').length})`;
      case 'RENTED':    return `Alquilados (${articles.filter(a => a.status === 'RENTED').length})`;
    }
  };

  const renderArticle = ({ item }: { item: UserArticle }) => {
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.articleCard}>
        <TouchableOpacity
          style={styles.cardPressable}
          onPress={() => handleEdit(item)}
          activeOpacity={0.85}
        >
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.articleImage} resizeMode="cover" />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <ImageIcon size={40} color="#ccc" />
              </View>
            )}
          </View>

          <View style={styles.articleInfo}>
            <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.priceRow}>
              <Ionicons name="cash-outline" size={16} color={Colors.primary} />
              <Text style={styles.articlePrice}>{`€${item.pricePerMonth.toFixed(2)}/mes`}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
              </View>
            </View>
            {item.status === 'RENTED' && item.rentedUntil && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>{`Hasta: ${formatDate(item.rentedUntil)}`}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() => handleEdit(item)}
            disabled={isDeleting}
          >
            <Pencil size={20} color={Colors.primary} />
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color="#d9534f" />
              : <Ionicons name="trash-outline" size={20} color="#d9534f" />
            }
          </Pressable>
        </View>
      </View>
    );
  };

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
          <AlertCircle size={60} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Artículos</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        {(['ALL', 'AVAILABLE', 'RENTED'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {getFilterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'ALL'
              ? 'No tienes artículos subidos'
              : `No tienes artículos ${filter === 'AVAILABLE' ? 'disponibles' : 'alquilados'}`}
          </Text>
          <Text style={styles.emptySubtext}>Pulsa el botón + para subir tu primer artículo</Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('UploadArticle')}
        activeOpacity={0.85}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
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
    color: Colors.textPrimary,
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
    paddingBottom: 100,
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
  cardPressable: {
    flexDirection: 'row',
    flex: 1,
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
    color: Colors.textPrimary,
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
  actionsContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: '#e8f4fd',
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: '#fdecea',
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
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default MyArticlesScreen;