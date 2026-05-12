import React, { useCallback } from "react";
import {
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

import { RootStackParamList } from "../../types";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  commonStyles,
  componentStyles,
} from "../../styles";
import { useTrackingNotifications } from "../../context/TrackingNotificationContext";

type NotificationsNav = NativeStackNavigationProp<RootStackParamList, "TrackingNotifications">;

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  dateLabel: string;
  read?: boolean;
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
};

const TrackingNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsNav>();
  const { notifications, markAllRead, clearAll, removeNotification } = useTrackingNotifications();

  useFocusEffect(
    useCallback(() => {
      if (notifications.some(n => !n.read)) {
        markAllRead();
      }
    }, [notifications, markAllRead]),
  );

  const data: NotificationItem[] = Array.from(
    new Map(notifications.map(n => [n.id, n])).values()
  ).map((n) => ({
    id: n.id,
    title: `Kit ${n.kitName}`,
    message: n.message,
    dateLabel: formatDateTime(n.createdAt),
    read: n.read,
  }));

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.card, !item.read && styles.cardUnread]}>
      {!item.read && <View style={styles.unreadIndicator} />}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
        <View style={styles.cardHeaderRight}>
          {item.dateLabel ? (
            <Text style={styles.cardDate}>{item.dateLabel}</Text>
          ) : null}
          <TouchableOpacity onPress={() => removeNotification(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#d9534f" />
          </TouchableOpacity>
        </View>
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

        <Text style={styles.headerTitle}>Notificaciones de seguimiento</Text>

        <View style={componentStyles.iconButton} />
      </View>

      {data.length > 0 && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Ionicons name="trash-outline" size={18} color="#d9534f" />
            <Text style={styles.clearButtonText}>Borrar todas las notificaciones</Text>
          </TouchableOpacity>
        </View>
      )}

      {data.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons
            name="mail-open-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            No tienes notificaciones de seguimiento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
  cardTitleUnread: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
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
    color: "#d9534f",
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

});

export default TrackingNotificationsScreen;
