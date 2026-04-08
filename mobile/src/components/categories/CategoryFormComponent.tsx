import React, { useState } from "react";
import { View, Text, Alert, Platform, StyleSheet, Animated } from "react-native";
import { Icon, TextInput } from "react-native-paper";
import { commonStyles } from "../../styles";
import { categoryFormScreenStyles } from "../../styles/categoryFormScreenStyles";
import { SelectPicker } from "../SelectPicker";
import { KeakitButton } from "../KeakitButton";
import { updateCategory, createCategory } from "../../services/categoryService";
import { Category } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

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
  token,
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successOpacity = React.useRef(new Animated.Value(0)).current;

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

      showSuccess();
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
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

  const showSuccess = () => {
    setSaveSuccess(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(successOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setSaveSuccess(false));
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

      {saveSuccess && (
        <Animated.View style={[styles.toast, { opacity: successOpacity }]}>
          <Icon source="check-circle-outline" size={18} color="#4caf7d" />
          <Text style={styles.toastText}>
            {formMode === "edit" ? "Categoría actualizada correctamente" : "Categoría creada correctamente"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    backgroundColor: "#c3f1d1",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 12,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4caf7d",
  },
});
