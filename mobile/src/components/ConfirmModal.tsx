import React from "react";
import { Modal, View, Text } from "react-native";
import { Button } from "react-native-paper";
import { Colors } from "../styles"; // ajusta la ruta según donde tengas Colors

type ConfirmModalProps = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string; // opcional, por defecto "Confirmar acción"
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  title = "Confirmar acción",
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: Colors.backgroundWhite,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: Colors.textPrimary }}>
          {title}
        </Text>
        <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 20 }}>
          {message}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
          <Button
            mode="outlined"
            onPress={onCancel}
            textColor={Colors.textPrimary}
            buttonColor={Colors.backgroundWhite}
            style={{ borderColor: Colors.border }}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            buttonColor={Colors.primary}
            textColor="#FFF"
          >
            Aceptar
          </Button>
        </View>
      </View>
    </View>
  </Modal>
);