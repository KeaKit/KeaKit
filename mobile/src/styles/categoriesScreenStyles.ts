import { StyleSheet } from "react-native";
import { Colors, Spacing } from "./theme";
import { commonStyles } from "./commonStyles";


export const categoriesScreenStyles = StyleSheet.create({

  categoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...commonStyles.cardSmall,
  },
  cardLeft: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardRight: {
    flexDirection: "column",
    gap: Spacing.sm,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  buttonsArea: {
    flexDirection: "row",
    gap: Spacing.sm,
  }
});
