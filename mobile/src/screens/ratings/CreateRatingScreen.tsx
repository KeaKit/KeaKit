import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, KitResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createRating } from '../../services/ratingService';
import { Colors, Spacing, FontSizes, FontWeights, commonStyles } from '../../styles';
import { API_ROUTES } from '../../config/api';
import { Helmet } from 'react-helmet-async'; 

type CreateRatingNav = NativeStackNavigationProp<RootStackParamList, 'CreateRating'>;
type CreateRatingRoute = RouteProp<RootStackParamList, 'CreateRating'>;

const CreateRatingScreen: React.FC = () => {
  const navigation = useNavigation<CreateRatingNav>();
  const route = useRoute<CreateRatingRoute>();
  const { user } = useAuth();
  const { kitId, revieweeId, revieweeName } = route.params as any;

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kit, setKit] = useState<KitResponse | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchKit = async () => {
      if (!kitId || !user?.token) return;
      try {
        const response = await fetch(API_ROUTES.GET_KIT(kitId), {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!response.ok) throw new Error('Error al cargar el kit');
        const data = await response.json();
        setKit(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'No se pudo cargar la información del kit');
        navigation.goBack();
      } finally {
        setFetching(false);
      }
    };
    fetchKit();
  }, [kitId, user?.token]);

  const handleSubmit = async () => {
    if (score === 0) {
      setError('Por favor, selecciona una puntuación');
      return;
    }
    if (!user || !kit) return;

    setLoading(true);
    setError('');

    if (revieweeId) {
      try {
        await createRating(
          {
            revieweeId,
            kitId,
            score,
            comment: comment.trim() || undefined,
          },
          user.token,
        );
        setLoading(false);
        navigation.goBack();
      } catch (err) {
        console.error(`Error al valorar a ${revieweeName}:`, err);
      }
    } else {
      // Obtener propietarios únicos del kit (ownerId único)
      const ownersMap = new Map<number, string>();
      kit.items?.forEach(item => {
        if (item.ownerId && !ownersMap.has(item.ownerId)) {
          ownersMap.set(item.ownerId, item.ownerName);
        }
      });
      const owners = Array.from(ownersMap.entries()).map(([id, name]) => ({ id, name }));

      if (owners.length === 0) {
        setError('No hay propietarios para valorar');
        setLoading(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const owner of owners) {
        try {
          await createRating(
            {
              revieweeId: owner.id,
              kitId,
              score,
              comment: comment.trim() || undefined,
            },
            user.token,
          );
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`Error al valorar a ${owner.name}:`, err);
        }
      }

      setLoading(false);
      if (failCount === 0) {
        Alert.alert('Éxito', `Se han enviado ${successCount} valoraciones correctamente.`);
        navigation.goBack();
      } else {
        Alert.alert(
          'Atención',
          `Se enviaron ${successCount} valoraciones, pero fallaron ${failCount}. Puedes intentar de nuevo más tarde.`
        );
      }
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Valorar kit | KeaKit</title>
        <meta name="description" content="Deja una valoración sobre tu experiencia con un kit en KeaKit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>             
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Valorar <Text style={commonStyles.headerTitle}>{revieweeName ? "a " + revieweeName : "kit"}</Text></Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[commonStyles.screenPadding, styles.content]}>
        <Text style={styles.title}>Puntúa tu experiencia</Text>
        <Text style={styles.subtitle}>Solo puedes valorar a un usuario una vez por kit.</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setScore(star)}>
              <Ionicons
                name={star <= score ? 'star' : 'star-outline'}
                size={40}
                color={Colors.warning}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[commonStyles.input, styles.commentInput]}
          placeholder="Escribe un comentario (opcional)"
          placeholderTextColor={Colors.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />

        {error ? (
          <View style={commonStyles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={commonStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[commonStyles.primaryButton, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Enviar Valoración</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  commentInput: {
    height: 120,
    marginBottom: Spacing.base,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateRatingScreen;