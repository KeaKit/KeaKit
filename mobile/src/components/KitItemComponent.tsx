import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Package, MinusCircle, PlusCircle, Trash2 } from "lucide-react-native";
import { Colors, commonStyles, componentStyles } from "../styles";
import { createKitStyles } from "../styles/createKitStyles";

type KitItemComponentProps = {
  item: {
    id: number;
    title: string;
    city?: string;
    pricePerMonth?: number;
    totalUnits?: number;
  };
  duration?: number;
  quantity: number;
  maxQuantity?: number;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
};

const KitItemComponent: React.FC<KitItemComponentProps> = ({
  item,
  duration,
  quantity,
  maxQuantity,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const reachedMax =
    maxQuantity !== undefined &&
    maxQuantity !== null &&
    quantity >= maxQuantity;

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
        <Package size={24} color={Colors.primary} />
      </View>

      <View style={createKitStyles.productInfo}>
        <Text style={createKitStyles.productTitle}>{item.title}</Text>

        <Text style={commonStyles.caption}>
          {item.city ? `${item.city}` : "Sin ciudad"}
        </Text>

        <Text style={commonStyles.caption}>
          Unidades seleccionadas: {quantity}
          {item.totalUnits ? ` / ${item.totalUnits}` : ""}
        </Text>
      </View>

      <View style={createKitStyles.productPriceActions}>
        <Text style={createKitStyles.productTitle}>
          {item.pricePerMonth !== undefined && duration !== undefined
            ? `${(item.pricePerMonth * quantity * duration).toFixed(2)}€`
            : "N/A"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <TouchableOpacity
            onPress={() => onDecrease(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Reducir unidades de ${item.title}`}
          >
            <MinusCircle
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <Text style={createKitStyles.productTitle}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => onIncrease(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Aumentar unidades de ${item.title}`}
          >
            <PlusCircle
              size={22}
              color={reachedMax ? Colors.border : Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={createKitStyles.removeItemButton}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.title} del kit`}
        >
          <Trash2 size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default KitItemComponent;