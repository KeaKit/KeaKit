import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { KitPaymentDTO } from "../types";
import { Colors, FontSizes, FontWeights } from "../styles/theme";
import { commonStyles } from "../styles/commonStyles";

export const KitPaymentResumeComponent = ({
  kitPrices,
}: {
  kitPrices: KitPaymentDTO;
}) => {
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={commonStyles.caption}>Subtotal productos</Text>
        <Text style={commonStyles.caption}>
          {(kitPrices.subtotalPrice / 100).toFixed(2)}€
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text style={commonStyles.caption}>Garantía (20%)</Text>
        <Text style={commonStyles.caption}>
          {(kitPrices.guarantee / 100).toFixed(2)}€
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text style={commonStyles.caption}>Tarifa de mensajería</Text>
        <Text style={commonStyles.caption}>
          {(kitPrices.courierPrice / 100).toFixed(2)}€
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingTop: 12,
          marginBottom: 16,
        }}
      >
        <Text style={[commonStyles.caption, styles.total]}>Total a pagar</Text>
        <Text style={styles.totalPrice}>
          {(kitPrices.totalPrice / 100).toFixed(2)}€
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  total: {
    color: Colors.primaryHome,
    fontWeight: "600",
    fontSize: FontSizes.lg,
  },
  totalPrice: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
    marginBottom: 2,
  },
});
