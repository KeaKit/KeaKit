import { DefaultKit } from "../../types";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, commonStyles, Spacing } from "../../styles";
import { KeakitButton } from "../KeakitButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type DefaultKitsNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKits"
>;

export const DefaultKitDetails = ({
  selectedKit,
  setSelectedKit,
}: {
  selectedKit: DefaultKit;
  setSelectedKit: (kit: DefaultKit | null) => void;
}) => {
  const navigation = useNavigation<DefaultKitsNav>();
  const id = selectedKit.id;
  const name = selectedKit.name;
  const items = selectedKit.items || [];

  return (
    <Modal
      visible={!!selectedKit}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedKit(null)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBgDismiss}
          onPress={() => setSelectedKit(null)}
        />

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{name}</Text>
          <Text style={styles.sheetSubtitle}>Contenido del kit:</Text>

          <ScrollView style={styles.itemsList}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>• {item.item.title}</Text>
                <Text style={styles.itemPrice}>
                  {item.item.pricePerMonth.toFixed(2).replace(".", ",")}€ / mes
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[commonStyles.buttonRow, { marginBottom: Spacing.lg }]}>
            <KeakitButton
              title="Personalizar"
              variant="green"
              icon="pencil"
              onPress={() => {
                setSelectedKit(null);
                navigation.navigate("EditDefaultKit", { kitId: id });
              }}
            />
            <KeakitButton
              title="Alquilar tal cual"
              icon="cart"
              onPress={() => {
                setSelectedKit(null);
                navigation.navigate("PurchaseDefaultKit", { kitId: id });
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBgDismiss: { flex: 1 },
  bottomSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primaryHome,
    marginBottom: Spacing.lg,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: Spacing.sm,
  },
  itemsList: { maxHeight: 200, marginBottom: Spacing.lg },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemName: { fontSize: 15, color: "#374151", flex: 1 },
  itemPrice: { fontSize: 15, fontWeight: "700", color: Colors.primaryHome },
});
