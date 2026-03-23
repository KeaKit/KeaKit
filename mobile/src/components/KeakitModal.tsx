import React from "react";
import { Modal, Portal, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from "../styles/theme";
import { KeakitButton } from "./KeakitButton";

type ModalVariant = "error" | "info";

interface KeakitModalProps {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  variant: ModalVariant;
}

export const KeakitModal = ({
  visible,
  onDismiss,
  message,
  variant,
}: KeakitModalProps) => {
  const getVariantTitle = () => {
    switch (variant) {
      case "error":
        return "Error";
      case "info":
        return "Información";
      default:
        return "";
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="titleMedium" style={styles.modalTitle}>
          {getVariantTitle()}
        </Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <KeakitButton
          title="Entendido"
          onPress={() => {
            onDismiss();
          }}
          variant="modalBlue"
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    margin: Spacing.sm,
  }
});
