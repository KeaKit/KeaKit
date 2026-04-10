import React from "react";
import { View, Text } from "react-native";
import { commonStyles, Colors } from "../../styles";
import { categoryFormScreenStyles } from "../../styles/categoryFormScreenStyles";
import { Category } from "../../types";
import { KeakitTag, KeakitButton } from "../";

const { formCard, inputRow, inputLabel, cardFooter } = categoryFormScreenStyles;

type Props = {
  category: Category;
  setMode: (mode: "view" | "edit") => void;
};

export const CategoryDetailsComponent = ({ category, setMode }: Props) => {
  return (
    <View style={formCard}>
      <View style={inputRow}>
        <Text style={inputLabel}>Nombre:</Text>
        <Text>{category.name}</Text>
      </View>

      <View style={commonStyles.dividerSmall} />

      <View style={[inputRow, { alignItems: "flex-start" }]}>
        <Text style={inputLabel}>Descripción:</Text>
        <Text>{category.description}</Text>
      </View>

      <View style={commonStyles.dividerSmall} />

      <View style={inputRow}>
        <Text style={inputLabel}>Estado:</Text>
        <KeakitTag
          title={category.status === "ACTIVE" ? "Activo" : "Borrador"}
          color={category.status === "ACTIVE" ? Colors.success : Colors.warning}
        />
      </View>
      <View style={commonStyles.dividerSmall} />

      <View style={inputRow}>
        <Text style={inputLabel}>Rango de precios:</Text>
        <Text>
          {category.minPrice}€ - {category.maxPrice}€
        </Text>
      </View>

      <View style={commonStyles.dividerSmall} />

      <View style={cardFooter}>
        <KeakitButton
          title="Editar categoría"
          onPress={() => {
            setMode("edit");
          }}
          icon="pencil"
        />
      </View>
    </View>
  );
};
