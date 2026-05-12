import React, { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, DefaultKit } from "../../../types";
import { Colors, commonStyles, Spacing } from "../../../styles";
import {
  fetchAllDefaultKits,
  deleteDefaultKit,
} from "../../../services/defaultKitService";
import {
  Header,
  KeakitModal,
  DefaultKitCard,
  KeakitButton,
} from "../../../components";
import { useNavbarOffset } from "../../../hooks/useWindowDimensions";

type DefaultKitsNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKits"
>;
import { Helmet } from 'react-helmet-async'; 


const DefaultKitsScreen: React.FC = () => {
  const { user } = useAuth();
  const token = user?.token || null;
  const isAdmin = user?.role === "ADMIN";
  const navigation = useNavigation<DefaultKitsNav>();
  const navbarOffset = useNavbarOffset();
  const [kits, setDefaultKits] = useState<DefaultKit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState<
    string | null
  >(null);
  const [kitToDelete, setKitToDelete] = useState<DefaultKit | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetchAllDefaultKits(token);
      setDefaultKits(res);
    } catch (error) {
      setError(
        "No se pudieron cargar los kits por defecto. Error: " +
          (error instanceof Error ? error.message : ""),
      );
      console.error("Error en DefaultKitsScreen:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void fetchData();
    }, [token]),
  );

  const performDelete = async () => {
    if (!token || !kitToDelete) return;
    try {
      await deleteDefaultKit(kitToDelete.id, token);
      setDefaultKits((prev) => prev.filter((k) => k.id !== kitToDelete.id));
    } catch (error) {
      setError(
        "No se pudo eliminar el kit. Error: " +
          (error instanceof Error ? error.message : ""),
      );
      console.error("Error al eliminar kit en DefaultKitsScreen:", error);
    }
    setKitToDelete(null);
    setConfirmDeleteMessage(null);
  };

  const renderKitCard = ({ item }: { item: DefaultKit }) => (
    <DefaultKitCard
      kit={item}
      isAdmin={isAdmin}
      setKitToDelete={setKitToDelete}
      setConfirmDeleteMessage={setConfirmDeleteMessage}
    />
  );

  return (
    <SafeAreaView style={[commonStyles.containerWhite, {paddingBottom: navbarOffset}]}>
      <Helmet>
        <title>Kits predeterminados | KeaKit</title>
        <meta
            name="description"
            content={
              isAdmin
                ? "Consulta los detalles y productos incluidos en este kit predeterminado de KeaKit."
                : "Consulta los productos incluidos en este kit express y personaliza tu alquiler en KeaKit."
            }
          />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>  
      <Header
        title={isAdmin ? "Gestión de Kits predeterminados" : "Kits Express"}
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <View style={commonStyles.contentContainer}>
        {isAdmin && (
          <KeakitButton
            title="Crear nuevo kit predeterminado"
            onPress={() =>
              navigation.navigate("DefaultKitForm", { mode: "create" })
            }
            icon="plus"
          />
        )}
        <KeakitModal
          visible={!!error}
          onDismiss={() => {
            setError(null);
          }}
          message={error || ""}
          variant="error"
        />
        <KeakitModal
          visible={!!confirmDeleteMessage}
          onDismiss={() => { setConfirmDeleteMessage(null); }}
          onConfirm={() => {
            if (confirmDeleteMessage) {
              void performDelete();
            }
          }}
          message={confirmDeleteMessage || ""}
          variant="confirmation"
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primaryHome}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={kits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderKitCard}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 100,
              gap: Spacing.md,
            }}
            ListEmptyComponent={
              <Text style={commonStyles.emptyText}>
                No hay kits disponibles en este momento.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DefaultKitsScreen;
