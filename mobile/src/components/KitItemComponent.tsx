import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, commonStyles } from "../styles";
import { createKitStyles } from "../styles/createKitStyles";

type KitItemComponentProps = {
  item: {
    id: number;
    title: string;
    city?: string;
    pricePerMonth?: number;
    totalUnits?: number;
    imageUrl?: string | null;
    category?: string;
    ownerName?: string;
    condition?: string | null;
  };
  duration?: number;
  quantity: number;
  maxQuantity?: number;
  onIncrease?: (id: number) => void;
  onDecrease?: (id: number) => void;
  onRemove: (id: number) => void;
  isEditable?: boolean;
};

const getConditionLabel = (condition?: string | null): string => {
  switch (condition) {
    case "NEW": return "Nuevo";
    case "LIGHTLY_USED": return "Poco usado";
    case "USED": return "Usado";
    case "WORN": return "Desgastado";
    default: return "";
  }
};

const KitItemComponent: React.FC<KitItemComponentProps> = ({
  item,
  duration,
  quantity,
  maxQuantity,
  onIncrease,
  onDecrease,
  onRemove,
  isEditable = true,
}) => {
  const reachedMax =
    maxQuantity !== undefined &&
    maxQuantity !== null &&
    quantity >= maxQuantity;

  const totalPrice = duration && item.pricePerMonth
    ? (item.pricePerMonth * quantity * duration).toFixed(2)
    : null;

  return (
    <View style={[createKitStyles.productRow, createKitStyles.productRowSelected]}>
      {/* Imagen */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={createKitStyles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={createKitStyles.productImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
        </View>
      )}

      {/* Información central */}
      <View style={createKitStyles.productInfo}>
        <Text style={createKitStyles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={commonStyles.caption}>
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

        <Text style={commonStyles.caption}>
          {item.city ? `${item.city}` : ""}
          {getConditionLabel(item.condition) && (
            <Text style={{ color: Colors.textSecondary }}>
              {item.city ? " · " : ""}
              Estado: {getConditionLabel(item.condition)}
            </Text>
          )}
        </Text>

        <Text style={commonStyles.caption}>
          Unidades seleccionadas: {quantity}
          {item.totalUnits && isEditable ? ` / ${item.totalUnits}` : ""}
        </Text>
      </View>

      {/* Columna derecha: Precio grande + Acciones */}
      <View style={createKitStyles.rightColumn}>
        {/* Precio grande */}
        {totalPrice && (
          <Text style={createKitStyles.largePrice}>
            {totalPrice}€
          </Text>
        )}

        {/* Acciones (selectores + eliminar) */}
        <View style={createKitStyles.actionsRow}>
          {isEditable && onDecrease && onIncrease && (
            <View style={createKitStyles.quantitySelector}>
              <TouchableOpacity
                onPress={() => onDecrease(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Reducir unidades de ${item.title}`}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={28}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <Text style={createKitStyles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => onIncrease(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Aumentar unidades de ${item.title}`}
                disabled={reachedMax}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color={reachedMax ? Colors.border : Colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={createKitStyles.removeButton}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.title} del kit`}
          >
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default KitItemComponent;