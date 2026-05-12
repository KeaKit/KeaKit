import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../../context/AuthContext";
import { RootStackParamList, ActivityNotification } from "../../types";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  commonStyles,
  componentStyles,
} from "../../styles";
import {
  getUserNotifications,
  markNotificationRead,
} from "../../services/notificationService";
import {
  formatNotificationDateTime,
  getActivityNotificationTitle,
} from "../../utils/activityNotifications";
import { Helmet } from 'react-helmet-async'; 


type NotificationsNav = NativeStackNavigationProp<
  RootStackParamList,
  "ActivityNotifications"
>;

const ActivityNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsNav>();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadIds = useMemo(
    () => notifications.filter((n) => !n.read).map((n) => n.id),
    [notifications],
  );

  const loadNotifications = async () => {
    if (!user?.id || !user?.token) {
      setNotifications([]);
      setLoading(false);
      setError("Debes iniciar sesión para ver notificaciones.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserNotifications(user.id, user.token);
      setNotifications(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las notificaciones.";
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!user?.token || unreadIds.length === 0) return;

    const results = await Promise.allSettled(
      unreadIds.map((id) => markNotificationRead(id, user.token)),
    );

    const hasSuccess = results.some((r) => r.status === "fulfilled");
    if (hasSuccess) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [user?.id, user?.token]),
  );

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkSingleRead = async (notificationId: number) => {
    if (!user?.token) return;

    try {
      await markNotificationRead(notificationId, user.token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  const renderItem = ({ item }: { item: ActivityNotification }) => {
    return (
      <View style={[styles.card, item.read ? styles.cardRead : styles.cardUnread]}>
        {!item.read && <View style={styles.unreadIndicator} />}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
              {getActivityNotificationTitle(item.type, item.relatedArticleId)}
            </Text>
            <Text style={styles.cardDate}>{formatNotificationDateTime(item.createdAt)}</Text>
          </View>
          {!item.read && (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => handleMarkSingleRead(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.cardMessage, item.read && styles.cardMessageRead]}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Notificaciones de actividad| KeaKit</title>
        <meta name="description" content="Consulta tus notificaciones de actividad en KeaKit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>       
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={componentStyles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificaciones de actividad</Text>

        <View style={componentStyles.iconButton} />
      </View>

      {unreadIds.length > 0 && !loading && !error && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.clearButton} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            <Text style={styles.clearButtonText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={commonStyles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons
            name="mail-open-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>No tienes notificaciones de actividad.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.base,
    textAlign: "center",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    position: 'relative',
  },
  cardUnread: {
    borderColor: Colors.primary,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
  },
  cardRead: {
    borderColor: Colors.border,
    opacity: 0.6,
    backgroundColor: "#F9F9F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  cardTitleUnread: {
    color: Colors.primary,
  },
  cardDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  cardMessage: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  cardMessageRead: {
    color: "#A0A0A0",
  },
  markReadButton: {
    padding: Spacing.xs,
  },
  actionsRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
});

export default ActivityNotificationsScreen;
