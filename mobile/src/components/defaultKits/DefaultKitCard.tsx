import { DefaultKit } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, commonStyles } from "../../styles";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Icon } from "react-native-paper";
import { KeakitCRUDButton } from "../KeakitCRUDButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type DefaultKitCardNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKits"
>;

export const DefaultKitCard = ({
  kit,
  isAdmin = false,
  setKitToDelete,
  setConfirmDeleteMessage
}: {
  kit: DefaultKit;
  isAdmin?: boolean;
  setKitToDelete: (kit: DefaultKit) => void;
  setConfirmDeleteMessage: (message: string) => void;
}) => {
  const navigation = useNavigation<DefaultKitCardNav>();

  const onDelete = () =>{
    setKitToDelete(kit);
    setConfirmDeleteMessage(`¿Deseas eliminar el kit predeterminado "${kit.name}"?`);
  }
  
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={()=>{navigation.navigate("DefaultKitDetails", { kitId: kit.id })}}>
      <View style={styles.cardIcon}>
        <Icon source="cube-outline" size={32} color={Colors.primaryHome} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={commonStyles.bodyStrong} numberOfLines={1}>
          {kit.name}
        </Text>
        <Text style={commonStyles.caption}>
          {kit.items?.length || 0} artículos incluidos
        </Text>
      </View>
      {!isAdmin? 
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
        :
        <View style={{flexDirection: "row", gap: Spacing.sm}}>
        <KeakitCRUDButton
          type="edit"
          onPress={() => {navigation.navigate("DefaultKitForm", {defaultKit: kit, mode: "edit"});}}
        />
        <KeakitCRUDButton
          type="delete"
          onPress={() => {onDelete()}}
          variant="violet"
        />
        </View>
        }
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...commonStyles.cardSmall,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.placeholderBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs
    },
});
