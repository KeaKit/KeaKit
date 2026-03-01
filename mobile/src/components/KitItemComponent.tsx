import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
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
  onRemove: (id: number) => void;
};

const KitItemComponent: React.FC<KitItemComponentProps> = ({
  item,
  duration,
  onRemove,
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

      <View style={createKitStyles.productPriceActions}>
        <Text style={createKitStyles.productTitle}>
          {item.pricePerMonth !== undefined && duration !== undefined
            ? `${(item.pricePerMonth * duration).toFixed(2)}€`
            : "N/A"}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={createKitStyles.removeItemButton}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.title} del kit`}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default KitItemComponent;
