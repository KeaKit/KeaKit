import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { commonStyles } from "../styles";
import { categoryFormScreenStyles } from "../styles/categoryFormScreenStyles";
import { SelectPicker } from "./SelectPicker";
import { KeakitButton } from "./KeakitButton";
import { updateCategory, createCategory } from "../services/categoryService";
import { Category } from "../types";
import { Platform, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type FormErrors = Partial<Record<keyof FormState, string>>;

interface FormState {
  name: string;
  description: string;
  status: "ACTIVE" | "DRAFT";
  minPrice: string;
  maxPrice: string;
}

type CategoryFormNav = NativeStackNavigationProp<
  RootStackParamList,
  "CategoryForm"
>;

interface CategoryFormComponentProps {
  categoryToEdit?: {
    id: number;
    name: string;
    description: string;
    status: "ACTIVE" | "DRAFT";
    minPrice: number;
    maxPrice: number;
  };
  formMode: "view" | "edit" | "create";
  navigation: CategoryFormNav;
  token: string;
}

const {
  formCard,
  inputRow,
  cardFooter,
  inputLabel,
  input,
  priceInput,
  priceSeparator,
} = categoryFormScreenStyles;

export const CategoryFormComponent: React.FC<CategoryFormComponentProps> = ({
  categoryToEdit,
  formMode,
  navigation,
  token
}) => {
  const [formData, setFormData] = useState<FormState>({
    name: categoryToEdit?.name || "",
    description: categoryToEdit?.description || "",
    status: categoryToEdit?.status || "DRAFT",
    minPrice: categoryToEdit?.minPrice?.toString() || "",
    maxPrice: categoryToEdit?.maxPrice?.toString() || "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria.";
    }
    if (!formData.minPrice.trim()) {
      newErrors.minPrice = "El precio mínimo es obligatorio.";
    } else if (isNaN(parseFloat(formData.minPrice))) {
      newErrors.minPrice = "El precio mínimo debe ser un número válido.";
    } else if (parseFloat(formData.minPrice) < 0) {
      newErrors.minPrice = "El precio mínimo no puede ser negativo.";
    }

    if (!formData.maxPrice.trim()) {
      newErrors.maxPrice = "El precio máximo es obligatorio.";
    } else if (isNaN(parseFloat(formData.maxPrice))) {
      newErrors.maxPrice = "El precio máximo debe ser un número válido.";
    } else {
      if (parseFloat(formData.maxPrice) < 0) {
        newErrors.maxPrice = "El precio máximo no puede ser negativo.";
      }

      if (parseFloat(formData.maxPrice) > 1000000) {
        newErrors.maxPrice = "El precio máximo no puede ser mayor a 1.000.000.";

        if (
          !isNaN(parseFloat(formData.minPrice)) &&
          parseFloat(formData.maxPrice) < parseFloat(formData.minPrice)
        ) {
          newErrors.maxPrice =
            "El precio máximo no puede ser menor que el precio mínimo.";
        }
      }
    }

    if (!formData.status) {
      newErrors.status = "El estado es obligatorio.";
    } else if (!["ACTIVE", "DRAFT"].includes(formData.status)) {
      newErrors.status = 'El estado debe ser "ACTIVE" o "DRAFT".';
    }

    setFormErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    validate();

    setIsSaving(true);
    try {
      const payload: Partial<Category> = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
      };

      const successMessage =
        formMode === "edit" ? "Categoría actualizada" : "Categoría creada";

      if (formMode === "edit" && categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload, token);
      } else {
        await createCategory(payload, token);
      }

      if (Platform.OS === "web") {
        window.alert(successMessage);
        navigation.goBack();
      } else {
        Alert.alert("Éxito", successMessage, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      Platform.OS === "web"
        ? window.alert(errorMessage)
        : Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const sanitizePrice = (price: string): string => {
    let res = price.replace(",", ".");
    res = res.replace(/[^0-9.]/g, "");

    const [integers, ...decimals] = res.split(".");
    if (decimals.length > 0) {
      res = `${integers}.${decimals.join("").slice(0, 2)}`;
    }

    const numericValue = parseFloat(res);
    if (!isNaN(numericValue) && numericValue > 1000000) {
      res = "1000000";
    }

    return res;
  };

  const handleChange = (name: keyof FormState, value: string) => {
    if (name === "minPrice" || name === "maxPrice") {
      value = sanitizePrice(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <View style={formCard}>
      <View style={inputRow}>
        <TextInput
          mode="outlined"
          label="Nombre de la categoría"
          placeholder="Ej. Electrónica"
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
          error={!!formErrors.name}
          style={input}
        />
      </View>

      <View style={commonStyles.dividerSmall} />

      <View style={inputRow}>
        <TextInput
          mode="outlined"
          label="Descripción"
          placeholder="Añade una descripción..."
          value={formData.description}
          onChangeText={(text) => handleChange("description", text)}
          error={!!formErrors.description}
          style={input}
          multiline
        />
      </View>
      <View style={commonStyles.dividerSmall} />

      <View style={inputRow}>
        <SelectPicker
          label="Estado"
          title="Selecciona un estado:"
          options={["ACTIVE", "DRAFT"].map((status) => ({
            label: status === "ACTIVE" ? "Activo" : "Borrador",
            value: status,
          }))}
          selectedValue={formData.status}
          onValueChange={(value) => handleChange("status", value)}
          placeholder="Selecciona un estado"
        />
      </View>

      <View style={commonStyles.dividerSmall} />
      <View style={{ flexDirection: "column", gap: 4 }}>
        <Text style={inputLabel}>Rango de precios: </Text>
        <View style={inputRow}>
          <TextInput
            mode="outlined"
            style={[input, priceInput]}
            keyboardType="numeric"
            placeholder="Mín"
            value={formData.minPrice}
            onChangeText={(text) => handleChange("minPrice", text)}
          />
          <Text style={priceSeparator}>€ -</Text>
          <TextInput
            mode="outlined"
            style={[input, priceInput]}
            keyboardType="numeric"
            placeholder="Máx"
            value={formData.maxPrice}
            onChangeText={(text) => handleChange("maxPrice", text)}
          />
          <Text style={priceSeparator}>€</Text>
        </View>
      </View>

      <View style={commonStyles.dividerSmall} />

      <View style={cardFooter}>
        <KeakitButton
          title={formMode === "edit" ? "Confirmar cambios" : "Crear categoría"}
          onPress={handleSave}
          loading={isSaving}
        />
      </View>
    </View>
  );
};
