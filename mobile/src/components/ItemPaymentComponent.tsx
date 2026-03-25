import { View, Text, Image } from "react-native";
import { KitItemResponse } from "../types";
import { StyleSheet } from "react-native";
import { Colors, Spacing } from "../styles/theme";
import { Icon } from "react-native-paper";

interface ItemPaymentComponentProps {
  item: KitItemResponse;
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

    // Calculate rental duration in days and prorate monthly price.
    // Previously we used only months difference which becomes 0 for short
    // rentals (e.g. < 1 month) and produced a total of 0. Use days-based
    // proration so short periods (like a few days) produce a proportional
    // amount.
    const msPerDay = 24 * 60 * 60 * 1000;
    // Use Math.ceil so a partial day counts as a full rental day.
    let days = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
    if (days <= 0) days = 1;

    // Business decision: prorrate month price by days/30.0 (consistent with
    // backend behaviour). Adjust if you prefer days/actualDaysInMonth.
    const factor = days / 30.0;
    const perUnit = item.pricePerMonth * factor;

    return perUnit * item.quantity;
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Icon source="image-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <Text style={styles.itemName}>
        {item.quantity} x {item.name}
      </Text>
      <Text style={styles.itemPrice}>
        {new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(calculateItemTotal())}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: Spacing.md,
  },
  itemName: {
    fontSize: 16,
    color: Colors.primaryHome,
  },
  itemPrice: {
    color: Colors.primaryHome,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginRight: Spacing.md,
    width: 80,
    height: 80,
  },
  articleImage: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
});
