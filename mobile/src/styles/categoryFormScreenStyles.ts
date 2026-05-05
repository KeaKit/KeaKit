import { StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from "./theme";

export const categoryFormScreenStyles = StyleSheet.create({
    scrollContent: 
    { 
        padding: Spacing.lg, 
        paddingBottom: 100 
    },
    formCard: 
    { 
        backgroundColor: Colors.backgroundWhite, 
        borderRadius: BorderRadius.xl, 
        padding: Spacing.lg, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        shadowColor: Colors.shadowColor || '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 8, 
        elevation: 2 
    },
    inputRow: 
    { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: Spacing.xs 
    },
    inputLabel: 
    { 
        fontSize: FontSizes.base, 
        color: Colors.textPrimary, 
        fontWeight: FontWeights.bold 
    },
    inlineInput: 
    { 
        flex: 1, 
        fontSize: FontSizes.base, 
        color: Colors.textPrimary, 
        paddingVertical: 0, 
        marginLeft: 4 
    },
    statusValue: 
    { 
        fontSize: FontSizes.base, 
        fontWeight: FontWeights.bold, 
        marginLeft: 4 
    },
    priceInput: 
    { 
        fontSize: FontSizes.base, 
        color: Colors.textPrimary, 
        fontWeight: FontWeights.bold, 
        paddingVertical: 0, 
        minWidth: 30, 
        textAlign: 'center' 
    },
    priceSeparator: 
    { 
        fontSize: FontSizes.base, 
        color: Colors.textPrimary, 
        fontWeight: FontWeights.bold 
    },
    divider: 
    { 
        height: 1, 
        backgroundColor: Colors.border, 
        marginVertical: Spacing.sm 
    },
    cardFooter: 
    { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginTop: Spacing.sm 
    },
    statsContainer: 
    { 
        gap: Spacing.sm 
    },
    statPill: 
    { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    statCircle: 
    { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: Spacing.sm 
    },
    statNumber: 
    { 
        fontSize: FontSizes.sm, 
        fontWeight: FontWeights.bold, 
        color: Colors.textPrimary 
    },
    statLabel: 
    { 
        fontSize: FontSizes.sm, 
        color: Colors.textSecondary, 
        fontWeight: FontWeights.medium 
    },
    saveButton: 
    { 
        backgroundColor: Colors.primaryDark || Colors.primary, 
        paddingHorizontal: Spacing.lg, 
        paddingVertical: Spacing.sm, 
        borderRadius: BorderRadius.full, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    saveButtonText: 
    { 
        color: Colors.textWhite, 
        fontSize: FontSizes.sm, 
        fontWeight: FontWeights.bold 
    },
    editButton: 
    { 
        flexDirection: 'row', 
        backgroundColor: Colors.primaryLight || Colors.primary, 
        paddingHorizontal: Spacing.lg, 
        paddingVertical: Spacing.sm, 
        borderRadius: BorderRadius.full, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    articleCard: 
    { 
        width: 140, 
        backgroundColor: Colors.backgroundWhite, 
        borderRadius: BorderRadius.lg, 
        padding: Spacing.sm, 
        marginRight: Spacing.md, 
        borderWidth: 1, 
        borderColor: Colors.border 
    },
    articleImage: 
    { 
        width: '100%', 
        height: 90, 
        borderRadius: BorderRadius.md, 
        backgroundColor: Colors.borderLight, 
        marginBottom: Spacing.sm 
    },
    
    imagePlaceholder: 
    { 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    
    articleInfo: 
    { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end' 
    },
    articleTitle: 
    { fontSize: FontSizes.sm, 
        fontWeight: FontWeights.bold, 
        color: Colors.textPrimary 
    },
    articleBadge: 
    { 
        fontSize: 10, 
        color: Colors.textSecondary, 
        marginTop: 2 
    },
    addIconSmall: 
    { 
        width: 24, 
        height: 24, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
})