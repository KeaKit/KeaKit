import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createKit } from "../../services/kitService";
import { useAuth } from "../../context/AuthContext";
import { Colors, commonStyles } from "../../styles";

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "Checkout">;

type CheckoutRouteParams = {
  kitData: {
    name: string;
    country: string;
    city: string;
    startDate: string;
    endDate: string;
    deliveryMethod: "COURIER" | "MEETING_POINT";
    meetingPoint?: string;
    courierAddress?: string;
    items: { id: number; quantity: number; pricePerMonth: number; ownerId: number }[];
  };
};

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutNav>();
  const { user } = useAuth();
  const route = useRoute<any>();
  const { kitData } = route.params as CheckoutRouteParams;

  // Inputs ficticios de tarjeta
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  const totalPrice = useMemo(() => {
    return kitData.items.reduce(
      (sum, item) => sum + item.pricePerMonth * item.quantity,
      0
    );
  }, [kitData.items]);

  const handlePay = async () => {
    if (!user?.token) {
      Alert.alert("Error", "Necesitas iniciar sesión.");
      return;
    }

    if (!cardNumber || !cvv || !expiry) {
      Alert.alert("Error", "Completa los datos de la tarjeta.");
      return;
    }

    try {
      // Aquí puedes hacer validaciones simples de tarjeta ficticia
      if (cardNumber.length !== 16 || cvv.length !== 3) {
        Alert.alert("Error", "Datos de tarjeta incorrectos.");
        return;
      }

      // Crear el payload para el backend
      const payload = {
        name: kitData.name,
        country: kitData.country,
        city: kitData.city,
        startDate: kitData.startDate,
        endDate: kitData.endDate,
        deliveryMethod: kitData.deliveryMethod,
        meetingPoint: kitData.meetingPoint,
        courierAddress: kitData.courierAddress,
        tenantId: user.id,
        itemSelections: kitData.items.map((i) => ({
          itemId: i.id,
          quantity: i.quantity,
        })),
      };

      await createKit(payload, user.token);

      Alert.alert("Éxito", "Kit creado y pagos realizados correctamente.", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al crear kit.";
      Alert.alert("Error", message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Resumen de precios</Text>

      {kitData.items.map((item) => (
        <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text>{`Item ${item.id} x${item.quantity}`}</Text>
          <Text>{(item.pricePerMonth * item.quantity).toFixed(2)}€</Text>
        </View>
      ))}

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
        <Text style={{ fontWeight: "bold" }}>Total:</Text>
        <Text style={{ fontWeight: "bold" }}>{totalPrice.toFixed(2)}€</Text>
      </View>

      <Text style={{ marginTop: 24, marginBottom: 8 }}>Número de tarjeta (ficticio)</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="1234 5678 9012 3456"
        value={cardNumber}
        onChangeText={setCardNumber}
        style={commonStyles.input}
      />

      <Text style={{ marginTop: 12, marginBottom: 8 }}>CVV</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="123"
        value={cvv}
        onChangeText={setCvv}
        style={commonStyles.input}
      />

      <Text style={{ marginTop: 12, marginBottom: 8 }}>Fecha de caducidad</Text>
      <TextInput
        placeholder="MM/YY"
        value={expiry}
        onChangeText={setExpiry}
        style={commonStyles.input}
      />

      <Button mode="contained" onPress={handlePay} style={{ marginTop: 24 }}>
        Pagar y Crear Kit
      </Button>
    </ScrollView>
  );
};

export default CheckoutScreen;