import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";
import { DefaultKit, DefaultKitItem, ItemCatalog, KitCreateRequest, ItemSelectionRequest } from "../../../types";
import { fetchDefaultKitById } from "../../../services/defaultKitService";
import { Header, KeakitButton, KeakitModal } from "../../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  commonStyles,
  Colors,
  Spacing,
} from "../../../styles";
import { Helmet } from 'react-helmet-async'; 


const DefaultKitDetailsScreen = () => {
  const { user } = useAuth();
  const token = user?.token || null;
  const isAdmin = user?.role === "ADMIN";
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { kitId } = route.params;
  const [kit, setKit] = useState<DefaultKit | null>(null);
  const [items, setItems] = useState<ItemCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadKitDetails = async () => {
      if (!token || !kitId || isNaN(kitId)) return;
      try {
        setLoading(true);
        const fetchKit = await fetchDefaultKitById(kitId, token);
        setKit(fetchKit);

        const fetchedItems: ItemCatalog[] = fetchKit.items
          .map((kitItem: DefaultKitItem) => kitItem.item)
          .filter(Boolean) as ItemCatalog[];
        setItems(fetchedItems);
      } catch (error) {
        setErrorMessage(
          "No se pudieron cargar los detalles del kit. Error: " +
            (error instanceof Error ? error.message : ""),
        );
        console.error("Error en DefaultKitDetailsScreen:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadKitDetails();
  }, [token, kitId]);

  const handleSubmit = (isEditable: boolean) => {
    if (!kit || !items.length || !token || items.length === 0 ) return;

    const name = isEditable ? `Mi versión de ${kit.name}` : `Kit Express ${kit.name}`;
    const mappedSelections: ItemSelectionRequest[] = items.map(
              (item) => ({
                itemId: item.id,
                quantity: 1,
                pricePerMonth: item.pricePerMonth || 0,
              }),
            );
    
    const kitData: Partial<KitCreateRequest> = {
      name: name,
      itemSelections: mappedSelections
    };

    navigation.navigate("CreateKit", { kitToCreate: kitData, isEditable: isEditable });
  }

  const renderItem = ({ item }: { item: ItemCatalog }) => (
    console.log("imagen del item:", item.imageUrl),
    <View style={styles.itemCard}>
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={commonStyles.caption}>
          {`${item.pricePerMonth.toFixed(2).replace(".", ",")} €/mes`}
        </Text>
    </View>
  )


  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <Helmet>
        <title> {isAdmin ? "Gestión de kits predeterminados" : "Kits Express"} | KeaKit </title>
        <meta name="description" content={isAdmin ? "Gestiona los kits predeterminados disponibles en la plataforma KeaKit." : "Explora kits express con productos listos para alquilar en KeaKit."}/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header
        title={kit ? kit.name : "Detalles del Kit"}
        showBack
        onBack={() => {
          navigation.goBack();
        }}
      />
      <View style={commonStyles.contentContainer}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.primaryHome}
            style={{ flex: 1 }}
          />
        )}
        {!loading && items.length > 0 && (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={true}
            contentContainerStyle={{  gap: Spacing.md }}
          />
        )}
        {!loading && items.length === 0 && (
          <Text style={commonStyles.emptyText}>
            Este kit no contiene productos en este momento.
          </Text>
        )}
        {errorMessage && (
          <KeakitModal
            visible={!!errorMessage}
            onDismiss={() => { setErrorMessage(null) }}
            message={errorMessage}
            variant="error"
          />
        )}
        
      </View>
      <View style={commonStyles.footerContainer}>
        {!isAdmin && (
          <>         
        <KeakitButton
          title="Personalizar kit"
          onPress={() => {
            handleSubmit(true);
          }}
          icon="pencil"
        />
        <KeakitButton
          title="Alquilar kit express sin modificaciones"
          onPress={() => {
            handleSubmit(false);
          }}
          icon="cart"
        />
        </>)}

        <KeakitButton
          title="Volver a la lista de kits express"
          onPress={() => {
            navigation.goBack();
          }}
          variant="violet"
        />
      </View>
    </SafeAreaView>
  );
};

export default DefaultKitDetailsScreen;

const styles = StyleSheet.create({
  itemCard:{
    ...commonStyles.cardSmall,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  itemName: {
    ...commonStyles.bodyStrong,
    color: Colors.primaryHome,
  },
});
