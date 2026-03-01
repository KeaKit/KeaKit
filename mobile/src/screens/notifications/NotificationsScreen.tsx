import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { KitResponse, RootStackParamList } from "../../types";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  commonStyles,
  componentStyles,
} from "../../styles";

type NotificationsNav = NativeStackNavigationProp<
  RootStackParamList,
  "Notifications"
>;

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  dateLabel: string;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : dateString;
};

const parseIsoDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const buildNotifications = (kits: KitResponse[]): NotificationItem[] => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const minDate = today;
  const maxDate = addDays(today, 1);

  return kits
    .map((kit) => ({
      kit,
      estimatedDate: parseIsoDate(kit.estimatedDeliveryDate),
    }))
    .filter(({ estimatedDate }) => {
      if (!estimatedDate) return false;
      return estimatedDate >= minDate && estimatedDate <= maxDate;
    })
    .sort((a, b) => {
      if (!a.estimatedDate || !b.estimatedDate) return 0;
      return a.estimatedDate.getTime() - b.estimatedDate.getTime();
    })
    .slice(0, 5)
    .map((kit) => ({
      id: `kit-${kit.kit.id}`,
      title: `Kit ${kit.kit.name}`,
      message:
        kit.kit.deliveryNotification ??
        `Tu pedido llegará el ${formatDate(kit.kit.estimatedDeliveryDate)}`,
      dateLabel: kit.kit.estimatedDeliveryDate
        ? formatDate(kit.kit.estimatedDeliveryDate)
        : "",
    }));
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsNav>();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        if (!user?.id) {
          setNotifications([]);
          setLoading(false);
          setError("Debes iniciar sesión para ver notificaciones.");
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await fetch(
            `${BASE_URL}/api/kits/my-kits/${user.id}`,
          );
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
          }

          const kits: KitResponse[] = await response.json();
          setNotifications(buildNotifications(kits));
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

      loadNotifications();
    }, [user?.id]),
  );

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.dateLabel ? (
          <Text style={styles.cardDate}>{item.dateLabel}</Text>
        ) : null}
      </View>
      <Text style={styles.cardMessage}>{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
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
          <Text style={styles.emptyText}>
            No tienes notificaciones por ahora.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
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
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  cardDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  cardMessage: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
});

export default NotificationsScreen;
