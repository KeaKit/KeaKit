import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from "../styles/theme";

interface ItemPaymentComponentProps {
  item: {
    itemId: number;
    name: string;
    category: string;
    imageUrl: string;
    ownerName: string;
    quantity: number;
    pricePerMonth: number;
  };
  startDate: string;
  endDate: string;
}

export const ItemPaymentComponent = ({
  item,
  startDate,
  endDate,
}: ItemPaymentComponentProps) => {
  const calculateItemTotal = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    let days = Math.ceil((end.getTime() - start.getTime() + 1) / msPerDay);
    if (days <= 0) days = 1;
    const factor = days / 30.0;
    const perUnit = item.pricePerMonth * factor;
    return perUnit * item.quantity;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const total = calculateItemTotal();

  return (
    <View style={styles.container}>
      {/* Imagen */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
        </View>
      )}

      {/* Información central */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.detail}>
          {item.category && (
            <Text style={{ color: Colors.textSecondary }}>{item.category}</Text>
          )}
          {item.ownerName && (
            <Text style={{ color: Colors.textSecondary }}>
              {item.category ? " · " : ""}
              {item.ownerName}
            </Text>
          )}
        </Text>

        <Text style={styles.detail}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>

        <Text style={styles.quantity}>
          Cantidad: {item.quantity}
        </Text>
      </View>

      {/* Precio grande a la derecha */}
      <Text style={styles.largePrice}>
        {total.toFixed(2)}€
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textPrimary,
  },
  detail: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  quantity: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  largePrice: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as "700",
    color: Colors.primary,
    textAlign: "right",
    minWidth: 90,
  },
});