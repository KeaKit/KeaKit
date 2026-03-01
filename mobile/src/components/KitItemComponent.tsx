import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, commonStyles, componentStyles } from "../styles";
import { createKitStyles } from "../styles/createKitStyles";

type KitItemComponentProps = {
  item: {
    id: number;
    title: string;
    city?: string;
    pricePerMonth?: number;
  };
  duration?: number;
};

const KitItemComponent: React.FC<KitItemComponentProps> = ({
  item,
  duration,
}) => {
  return (
    <View
      key={item.id}
      style={[
        componentStyles.listItem,
        createKitStyles.productRow,
        createKitStyles.productRowSelected,
      ]}
    >
      <View style={createKitStyles.productThumb}>
        <Ionicons name="cube-outline" size={24} color={Colors.primary} />
      </View>

      <View style={createKitStyles.productInfo}>
        <Text style={createKitStyles.productTitle}>{item.title}</Text>

        <Text style={commonStyles.caption}>
          {item.city ? `${item.city}` : "Sin ciudad"}
        </Text>
      </View>

      {/* TODO: Añadir este precio total por item al backend para que el arrendador pueda cobrarlo */}
      <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
        <Text style={createKitStyles.productTitle}>
          {item.pricePerMonth !== undefined && duration !== undefined
            ? `${(item.pricePerMonth * duration).toFixed(2)}€`
            : "N/A"}
        </Text>
      </View>

      {/* TODO(Salma): Eliminar objetos del kit */}
      {/*TODO(Salma): Seleccionar varias unidades de un mismo producto */}

    </View>
  );
};

export default KitItemComponent;
