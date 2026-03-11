import { StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from "./theme";

export const categoriesScreenStyles = StyleSheet.create({
    roundedSearch: { 
        borderRadius: BorderRadius.full 
    },
    listContainer: { 
        paddingBottom: 100 
    },
    categoryCard: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: Colors.backgroundWhite, 
        borderRadius: BorderRadius.full, 
        paddingHorizontal: Spacing.lg, 
        paddingVertical: Spacing.md, 
        marginBottom: Spacing.md, 
        borderWidth: 1, 
        borderColor: Colors.border 
    },
    cardLeft: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1 
    },
    categoryAvatar: { 
        width: 48, 
        height: 48, 
        borderRadius: BorderRadius.full, 
        backgroundColor: Colors.textLight, 
        marginRight: Spacing.md 
    },
    categoryName: { 
        fontSize: FontSizes.base, 
        fontWeight: FontWeights.bold, 
        color: Colors.textPrimary, 
        alignSelf: 'flex-start' 
    },
    cardRight: { 
        alignItems: 'flex-end', 
        justifyContent: 'center', 
        gap: Spacing.xs 
    },
    statusText: { 
        fontSize: FontSizes.sm, 
        fontWeight: FontWeights.bold, 
        marginRight: Spacing.sm 
    },
    fab: { 
        position: 'absolute', 
        bottom: 28, 
        right: 24, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: Colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 6, 
        elevation: 8 },
})