import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RatingResponse, UserResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getRatingsForUser } from '../../services/ratingService';
import { getUserById } from '../../services/authService'; 
import { ProfileImageWithBadge } from '../../components/ProfileImageWithBadge'; 
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';
import { getPublicUserProfile } from '../../services/userService';
import { Helmet } from 'react-helmet-async'; 

type UserRatingsNav = NativeStackNavigationProp<RootStackParamList, 'UserRatings'>;
type UserRatingsRoute = RouteProp<RootStackParamList, 'UserRatings'>;

const UserRatingsScreen: React.FC = () => {
  const navigation = useNavigation<UserRatingsNav>();
  const route = useRoute<UserRatingsRoute>();
  const { user } = useAuth();
  const { userId, userName } = route.params;

  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const [publicProfile, setPublicProfile] = useState<{ profileImageUrl?: string; founderBadge?: boolean }>({});
  useEffect(() => {
    loadPublicProfile();
    loadRatings();
  }, []);

  const loadPublicProfile = async () => {
    try {
      const data = await getPublicUserProfile(userId);
      setPublicProfile({
        profileImageUrl: data.profileImageUrl,
        founderBadge: data.founderBadge,
      });
    } catch (err) {
      console.warn('No se pudo cargar la imagen pública del usuario');
    }
  };

  const loadRatings = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getRatingsForUser(userId, user.token);
      setRatings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar valoraciones');
    } finally {
      setLoading(false);
    }
  };

  const averageScore =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

  const renderStars = (score: number) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= score ? 'star' : 'star-outline'}
          size={16}
          color={Colors.warning}
        />
      ))}
    </View>
  );

  const getTypeLabel = (type: string) => {
    return type === 'RENTER_TO_OWNER'
      ? 'Valoración enviada'
      : 'Valoración recibida';
  };

  const renderRatingItem = ({ item }: { item: RatingResponse }) => (
    <View style={[commonStyles.cardSmall, styles.ratingCard]}>
      <View style={styles.ratingHeader}>
        {renderStars(item.score)}
        <Text style={styles.ratingDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.comment ? (
        <Text style={styles.ratingComment}>{item.comment}</Text>
      ) : null}
      <View style={styles.ratingMeta}>
        <Text style={styles.metaText}>
          De: {item.reviewerName}
        </Text>
        <Text style={styles.metaText}>Kit: {item.kitName}</Text>
        <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Valoraciones | KeaKit</title>
        <meta name="description" content="Consulta las valoraciones que has recibido en Keakit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>           
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Valoraciones</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={commonStyles.centerContent}>
          <View style={commonStyles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={commonStyles.errorText}>{error}</Text>
          </View>
        </View>
      ) : (
        <>
          <View style={[commonStyles.screenPadding, styles.summarySection]}>
            {/* Imagen de perfil con insignia */}
            <ProfileImageWithBadge
              imageUrl={publicProfile.profileImageUrl}
              size={80}
              founderBadge={publicProfile.founderBadge || false}
            />
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.averageRow}>
              <Ionicons name="star" size={24} color={Colors.warning} />
              <Text style={styles.averageScore}>
                {averageScore > 0 ? averageScore.toFixed(1) : '—'}
              </Text>
              <Text style={styles.ratingsCount}>
                ({ratings.length} {ratings.length === 1 ? 'valoración' : 'valoraciones'})
              </Text>
            </View>
          </View>

          <FlatList
            data={ratings}
            renderItem={renderRatingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={commonStyles.centerContent}>
                <Text style={styles.emptyText}>No hay valoraciones todavía</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summarySection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  averageScore: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
  },
  ratingsCount: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  ratingCard: {
    marginBottom: Spacing.xs,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingDate: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  ratingComment: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  ratingMeta: {
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  typeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primaryLight,
    fontWeight: FontWeights.medium as '500',
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});

export default UserRatingsScreen;