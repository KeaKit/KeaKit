import React from "react";
import { Modal, Portal, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from "../styles/theme";
import { KeakitButton } from "./KeakitButton";

type ModalVariant = "error" | "info" | "confirmation";

interface KeakitModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm?: () => void;
  message: string;
  variant: ModalVariant;
}

export const KeakitModal = ({
  visible,
  onDismiss,
  onConfirm,
  message,
  variant,
}: KeakitModalProps) => {
  const getVariantTitle = () => {
    switch (variant) {
      case "error":
        return "Error";
      case "info":
        return "Información";
      case "confirmation":
        return "Confirmar acción";
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
        {variant === "confirmation" ? (
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonInGroup}>
              <KeakitButton
                title="Confirmar"
                onPress={() => {
                  onConfirm?.();
                  onDismiss();
                }}
                variant="green"
              />
            </View>
            <View style={styles.buttonInGroup}>
              <KeakitButton
                title="Cancelar"
                onPress={onDismiss}
                variant="violet"
              />
            </View>
          </View>
        ) : (
          <KeakitButton
            title="Entendido"
            onPress={() => {
              onDismiss();
            }}
            variant="modalBlue"
          />
        )}
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
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInGroup: {
    flex: 1,
  }
});
