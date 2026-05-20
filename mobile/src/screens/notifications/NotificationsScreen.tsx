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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Helmet } from 'react-helmet-async'; 
import { useAuth } from "../../context/AuthContext";
import { useTrackingNotifications } from "../../context/TrackingNotificationContext";
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
  deleteNotification,
} from "../../services/notificationService";
import {
  formatNotificationDateTime,
  getActivityNotificationTitle,
} from "../../utils/activityNotifications";

type NotificationsNav = NativeStackNavigationProp<RootStackParamList, "Notifications">;

type UnifiedNotification = {
  id: string;
  originalId: string | number;
  type: "TRACKING" | "ACTIVITY";
  title: string;
  message: string;
  dateLabel: string;
  read: boolean;
};

const formatTrackingDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsNav>();
  const { user } = useAuth();
  
  const { 
    notifications: trackingNotifications, 
    markAllRead: markAllTrackingRead, 
    clearAll: clearAllTracking, 
    removeNotification: removeTrackingNotification 
  } = useTrackingNotifications();

  const [activityNotifications, setActivityNotifications] = useState<ActivityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadActivityIds = useMemo(
    () => activityNotifications.filter((n) => !n.read).map((n) => n.id),
    [activityNotifications],
  );

  const loadActivityNotifications = async () => {
    if (!user?.id || !user?.token) {
      setActivityNotifications([]);
      setLoading(false);
      setError("Debes iniciar sesión para ver notificaciones.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserNotifications(user.id, user.token);
      setActivityNotifications(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las notificaciones de actividad.";
      setError(message);
      setActivityNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActivityNotifications();
      
      if (trackingNotifications.some(n => !n.read)) {
        markAllTrackingRead();
      }
    }, [user?.id, user?.token, trackingNotifications])
  );

  const handleMarkAllActivityRead = async () => {
    if (!user?.token || unreadActivityIds.length === 0) return;

    const results = await Promise.allSettled(
      unreadActivityIds.map((id) => markNotificationRead(id, user.token))
    );

    const hasSuccess = results.some((r) => r.status === "fulfilled");
    if (hasSuccess) {
      setActivityNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleCheckActivityNotification = async (notificationId: number) => {
    if (!user?.token) return;

    try {
      await deleteNotification(notificationId, user.token);
      setActivityNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Error al quitar la notificación de actividad:", err);
    }
  };

  const combinedNotifications = useMemo((): UnifiedNotification[] => {
    const uniqueTracking = Array.from(
      new Map(trackingNotifications.map(n => [n.id, n])).values()
    ).map((n) => ({
      id: `tracking-${n.id}`,
      originalId: n.id,
      type: "TRACKING" as const,
      title: `Kit ${n.kitName}`,
      message: n.message,
      dateLabel: formatTrackingDateTime(n.createdAt),
      read: true,
    }));

    const mappedActivity = activityNotifications.map((n) => ({
      id: `activity-${n.id}`,
      originalId: n.id,
      type: "ACTIVITY" as const,
      title: getActivityNotificationTitle(n.type, n.relatedArticleId),
      message: n.message,
      dateLabel: formatNotificationDateTime(n.createdAt),
      read: n.read,
    }));

    return [...uniqueTracking, ...mappedActivity];
  }, [trackingNotifications, activityNotifications]);

  const renderItem = ({ item }: { item: UnifiedNotification }) => (
    <View style={[styles.card, item.read ? styles.cardRead : styles.cardUnread]}>
      {!item.read && <View style={styles.unreadIndicator} />}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
            {item.title}
          </Text>
        </View>
        
        {item.type === "TRACKING" ? (
          <TouchableOpacity 
            style={styles.actionIconButton} 
            onPress={() => removeTrackingNotification(item.originalId as string)}
          >
            <Ionicons name="trash-outline" size={16} color="#d9534f" />
          </TouchableOpacity>
        ) : (
          !item.read && (
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleCheckActivityNotification(item.originalId as number)}
            >
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            </TouchableOpacity>
          )
        )}
      </View>
      <Text style={[styles.cardMessage, item.read && styles.cardMessageRead]}>
        {item.message}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Notificaciones | KeaKit</title>
        <meta name="description" content="Consulta tus notificaciones en KeaKit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>       
      
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={componentStyles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={componentStyles.iconButton} />
      </View>

      {!loading && !error && combinedNotifications.length > 0 && (
        <View style={styles.actionsContainer}>
          {unreadActivityIds.length > 0 && (
            <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllActivityRead}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={styles.actionButtonTextPrimary}>Marcar todas como leídas</Text>
            </TouchableOpacity>
          )}
          {trackingNotifications.length > 0 && (
            <TouchableOpacity style={styles.actionButton} onPress={clearAllTracking}>
              <Ionicons name="trash-outline" size={18} color="#d9534f" />
              <Text style={styles.actionButtonTextDanger}>Borrar todas las notificaciones</Text>
            </TouchableOpacity>
          )}
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
      ) : combinedNotifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons
            name="mail-open-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>No tienes notificaciones por ahora.</Text>
        </View>
      ) : (
        <FlatList
          data={combinedNotifications}
          keyExtractor={(item) => item.id}
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
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between"
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonTextPrimary: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  actionButtonTextDanger: {
    color: "#d9534f",
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    position: "relative",
  },
  cardUnread: {
    borderColor: Colors.primary,
  },
  unreadIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4444",
  },
  cardRead: {
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
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
    opacity: 0.8,
  },
  actionIconButton: {
    padding: Spacing.xs,
  },
});

export default NotificationsScreen;