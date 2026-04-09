import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Colors, commonStyles } from "../../styles";
import {
  Header,
  CategoryFormComponent,
  CategoryDetailsComponent,
  CategoryArticlesComponent,
} from "../../components";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: "#E3F2FD",
    onPrimaryContainer: Colors.primary,
    surface: "#FFFFFF",
    onSurface: "#1C1B1F",
    surfaceVariant: "#E7E0EC",
    onSurfaceVariant: "#49454F",
    secondaryContainer: "#E3F2FD",
    onSecondaryContainer: Colors.primary,
    outline: Colors.border,
    outlineVariant: Colors.success,
  },
};


type CategoryFormNav = NativeStackNavigationProp<
  RootStackParamList,
  "CategoryForm"
>;

type CategoryFormRoute = RouteProp<RootStackParamList, "CategoryForm">;

export default function CategoryDetailsScreen() {
  const route = useRoute<CategoryFormRoute>();
  const categoryToEdit = route.params?.category;
  const initialMode = route.params?.mode || "create";
  const [formMode, setFormMode] = useState<"view" | "edit" | "create">(
    initialMode,
  );
  const isEditable = formMode !== "view";

  const navigation = useNavigation<CategoryFormNav>();

  const { user } = useAuth();
  const token = (user as any)?.token || "";

  const getHeaderTitle = () => {
    if (formMode === "view") return "Detalles de categoría";
    if (formMode === "edit") return "Editar categoría";
    return "Crear categoría";
  };

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        <Header
          title={getHeaderTitle()}
          showBack={true}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={commonStyles.contentContainer}
        >
          {isEditable ? (
            <CategoryFormComponent
              categoryToEdit={categoryToEdit}
              formMode={formMode}
              navigation={navigation}
              token={token}
            />
          ) : (
            <CategoryDetailsComponent
              category={categoryToEdit!}
              setMode={setFormMode}
            />
          )}
          {categoryToEdit && (
            <CategoryArticlesComponent
              category={categoryToEdit}
              token={token}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}
