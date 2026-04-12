import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, DefaultKit } from "../../../types";
import { Colors, commonStyles, Spacing } from "../../../styles";
import { fetchAllDefaultKits } from "../../../services/defaultKitService";
import {
  Header,
  KeakitModal,
  DefaultKitCard,
  DefaultKitDetails,
} from "../../../components";

type DefaultKitsNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKits"
>;

const DefaultKitsScreen: React.FC = () => {
  const { user } = useAuth();
  const token = user?.token || null;
  const navigation = useNavigation<DefaultKitsNav>();

  const [kits, setDefaultKits] = useState<DefaultKit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKit, setSelectedKit] = useState<DefaultKit | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [token]);

  const renderKitCard = ({ item }: { item: DefaultKit }) => (
    <DefaultKitCard kit={item} onPress={() => setSelectedKit(item)} />
  );

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
      <Header
        title="Kits Express"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <View style={commonStyles.contentContainer}>
        <KeakitModal
          visible={!!error}
          onDismiss={() => {
            setError(null);
          }}
          message={error || ""}
          variant="error"
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
            contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: Spacing.md }}
            ListEmptyComponent={
              <Text style={commonStyles.emptyText}>
                No hay kits disponibles en este momento.
              </Text>
            }
          />
        )}

        {selectedKit && (
          <DefaultKitDetails
            selectedKit={selectedKit}
            setSelectedKit={setSelectedKit}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DefaultKitsScreen;
