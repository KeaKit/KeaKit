import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createKit } from "../../services/kitService";
import { useAuth } from "../../context/AuthContext";
import { Colors, commonStyles } from "../../styles";
import { Ionicons } from "@expo/vector-icons";

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;

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

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  const totalPrice = useMemo(() => {
    return kitData.items.reduce(
      (sum, item) => sum + item.pricePerMonth * item.quantity,
      0
    );
  }, [kitData.items]);

  // 🔒 handlers con límite de longitud
  const handleCardChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(cleaned);
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 3);
    setCvv(cleaned);
  };

  const handleExpiryChange = (value: string) => {
    let cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setExpiry(cleaned);
  };

  const handlePay = async () => {
      console.log("🟡 CLICK en Pagar");

    console.log("👤 Usuario:", user);
   console.log("🔐 Token:", user?.token);

    if (!user?.token) {
      console.log("❌ No hay token");
      Alert.alert("Error", "Necesitas iniciar sesión.");
      return;
    }
    console.log("💳 Datos tarjeta:", { cardNumber, cvv, expiry });
    if (!cardNumber || !cvv || !expiry) {
      Alert.alert("Error", "Completa los datos de la tarjeta.");
      return;
    }

    if (cardNumber.length !== 16 || cvv.length !== 3 || expiry.length !== 5) {
      Alert.alert("Error", "Datos de tarjeta incorrectos.");
      return;
    }

    try {
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

      console.log("📦 Payload que se envía al backend:", payload);

      const response = await createKit(payload, user.token);

      console.log("✅ Respuesta del backend:", response);

       console.log("➡️ Navegando a Home...");

      // 👇 Navegación directa a Home
      navigation.navigate("MyKits");

      console.log("🏁 Navegación ejecutada");
    } catch (error) {
      console.log("🔥 ERROR en createKit:", error);
      const message =
        error instanceof Error ? error.message : "Error al crear kit.";
      Alert.alert("Error", message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* HEADER CON FLECHA */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ marginRight: 8 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Pago</Text>
      </View>

      {/* RESUMEN */}
      <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
        Resumen de precios
      </Text>

      {kitData.items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text>{`Item ${item.id} x${item.quantity}`}</Text>
          <Text>{(item.pricePerMonth * item.quantity).toFixed(2)}€</Text>
        </View>
      ))}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Total:</Text>
        <Text style={{ fontWeight: "bold", color: Colors.primary }}>
          {totalPrice.toFixed(2)}€
        </Text>
      </View>

      {/* TARJETA */}
      <Text style={{ marginTop: 24, marginBottom: 8 }}>
        Datos de la tarjeta
      </Text>

      <TextInput
        mode="outlined"
        label="Número de tarjeta"
        value={cardNumber}
        onChangeText={handleCardChange}
        keyboardType="numeric"
        left={<TextInput.Icon icon={() => <Ionicons name="card-outline" size={20} />} />}
        style={{ marginBottom: 12 }}
        placeholder="1234 5678 9012 3456"
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          mode="outlined"
          label="CVV"
          value={cvv}
          onChangeText={handleCvvChange}
          keyboardType="numeric"
          left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} />} />}
          style={{ flex: 1 }}
          placeholder="123"
        />

        <TextInput
          mode="outlined"
          label="Expiración"
          value={expiry}
          onChangeText={handleExpiryChange}
          left={<TextInput.Icon icon={() => <Ionicons name="calendar-outline" size={20} />} />}
          style={{ flex: 1 }}
          placeholder="MM/YY"
        />
      </View>

      {/* BOTÓN */}
      <Button
        mode="contained"
        onPress={handlePay}
        style={{ marginTop: 24, borderRadius: 8 }}
        contentStyle={{ paddingVertical: 8 }}
      >
        Pagar y Crear Kit
      </Button>
    </ScrollView>
  );
};

export default CheckoutScreen;