// styles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { Colors, Spacing } from "./theme";

type Styles = {
  headerTitle: TextStyle;
  scrollContent: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  fieldContainer: ViewStyle;
  labelRow: ViewStyle;
  label: TextStyle;
  optional: TextStyle;
  textarea: ViewStyle;
  pickerWrapper: ViewStyle;
  pickerWrapperError: ViewStyle;
  pickerIcon: ViewStyle;
  categorySelector: ViewStyle;
  categorySelectorText: TextStyle;
  categoryDropdown: ViewStyle;
  categoryOption: ViewStyle;
  categoryOptionSelected: ViewStyle;
  categoryOptionText: TextStyle;
  categoryOptionTextSelected: TextStyle;
  helperText: TextStyle;
  dateSelector: ViewStyle;
  dateSelectorText: TextStyle;
  dateRightIcons: ViewStyle;
  imageSelectorContainer: ViewStyle;
  selectedImageContainer: ViewStyle;
  imagePreview: ImageStyle;
  changeImageButton: ViewStyle;
  imagePlaceholder: ViewStyle;
  placeholderText: TextStyle;
  buttonRow: ViewStyle;
  imageButton: ViewStyle;
  imageButtonText: TextStyle;
  submitContent: ViewStyle;
  buttonDisabled: ViewStyle;
  conditionRow: ViewStyle;
  conditionChip: ViewStyle;
  conditionChipActive: ViewStyle;
  conditionChipText: TextStyle;
  conditionChipTextActive: TextStyle;
};

export const styles = StyleSheet.create<Styles>({
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldContainer: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optional: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  textarea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerWrapperError: {
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  pickerIcon: {
    marginRight: Spacing.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  categoryDropdown: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary + '12',
  },
  categoryOptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  categoryOptionTextSelected: {
    fontWeight: '700',
    color: Colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: -4,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  dateRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageSelectorContainer: {
    gap: Spacing.sm,
  },
  selectedImageContainer: {
    position: 'relative',
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  changeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
  },
  imagePlaceholder: {
    height: 180,
    width: '100%',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: 8,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  imageButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  conditionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  conditionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  conditionChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  conditionChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});