import { DefaultKit } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, commonStyles } from "../../styles";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Icon } from "react-native-paper";

export const DefaultKitCard = ({
  kit,
  onPress,
}: {
  kit: DefaultKit;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
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
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
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
