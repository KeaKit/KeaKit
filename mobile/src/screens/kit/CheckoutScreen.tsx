import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, TextInput, ActivityIndicator, Modal, Portal } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Kit, RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { Colors, commonStyles } from "../../styles";
import { Ionicons } from "@expo/vector-icons";
import { API_ROUTES } from "../../config/api";

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutNav>();
  const { user } = useAuth();
  const route = useRoute<any>();
  const createdKit = route.params as Kit;
  const items = createdKit.kitItems || [];
  const [isProcessing, setIsProcessing] = useState(false);
  console.log("🚀 CheckoutScreen - Kit recibido:", createdKit);
  console.log("🚀 CheckoutScreen - Items en el kit:", items);

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  // Autorrellenado con tarjeta de prueba (usar solo en desarrollo)
  const fillTestData = () => {
    setCardNumber("4242424242424242");
    setCvv("123");
    setExpiry("12/28"); // Una fecha futura válida
  };

  useEffect(() => {
      fillTestData();
  }, []);
  // --------------------------------------------------------------

  const totalPrice = useMemo(() => {
    if(items.length === 0) return 0;

    return items.reduce(
      (sum, item) => {
        const price = Number(item.pricePerMonth) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (price * quantity);
      },
      0,
    );
  }, [items]);
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

  const validatePayment = () => {
    if (isProcessing) return true;
    if (!user || user==null || !user?.token || !user?.id) {
      console.error("❌ Necesitas iniciar sesión.");
      return false;
    }
    if (!cardNumber || !cvv || !expiry) {
      console.error("❌ Completa los datos de la tarjeta.");
      return false;
    }
    if (cardNumber.length !== 16 || cvv.length !== 3 || expiry.length !== 5) {
      console.error("❌ Formato de tarjeta incorrecto.");
      return false;
    }
    console.log("📋 Items en el kit:", items);
    if(!items || items.length === 0) {
      console.error("❌ No hay items en el kit.");
      return false;
    }
    return true;
  }

  const handlePay = async () => {
    console.log("🟡 CLICK en Pagar");

    if (!validatePayment()) return;

    setIsProcessing(true);
    console.log("💳 Procesando pago con Stripe...");

    try {
      // Calcular monto en céntimos
      const amountInCents = Math.round(totalPrice * 100);
      console.log(`💰 Monto a pagar: ${amountInCents} céntimos`);

      // Llamar al endpoint de Stripe con metadata del kit
      const paymentResponse = await fetch(API_ROUTES.SIMULATE_PAYMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          amount: amountInCents,
          kitId: createdKit.id,
          userId: user?.id,
          startDate: createdKit.startDate,
          endDate: createdKit.endDate,
          items: JSON.stringify(
            items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              pricePerMonth: item.pricePerMonth,
            }))
          ),
        }),
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text()
        throw new Error(`Error al procesar el pago: ${errorText}`)
      }

      const paymentData = await paymentResponse.json()
      console.log("✅ Pago procesado:", paymentData)

      if (paymentData.status !== "succeeded") {
        throw new Error("El pago no fue exitoso")
      }

      navigation.navigate("MyKits");
    } catch (error) {
      console.log("🔥 ERROR al procesar pago:", error)
    }finally {
      setIsProcessing(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>

      {/* HEADER CON FLECHA */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
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

      {items.length === 0 ? (
        <Text>No hay items en el kit.</Text> // TODO: No debería llegar a esta pantalla si no hay ningún item. Comprobar en CreateKitScreen que no se pueda avanzar sin seleccionar al menos un item. 
      ) : (
        items.map((item, index) => (
          <View
            key={item.id || index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text>{`${item.item.title} x${item.quantity || 1}`}</Text>
            <Text>{(item.pricePerMonth * (item.quantity || 1)).toFixed(2)}€</Text>
          </View>
        ))
      )}

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
        left={
          <TextInput.Icon
            icon={() => <Ionicons name="card-outline" size={20} />}
          />
        }
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
          left={
            <TextInput.Icon
              icon={() => <Ionicons name="lock-closed-outline" size={20} />}
            />
          }
          style={{ flex: 1 }}
          placeholder="123"
        />

        <TextInput
          mode="outlined"
          label="Expiración"
          value={expiry}
          onChangeText={handleExpiryChange}
          left={
            <TextInput.Icon
              icon={() => <Ionicons name="calendar-outline" size={20} />}
            />
          }
          style={{ flex: 1 }}
          placeholder="MM/YY"
        />
      </View>

      {/* BOTÓN */}
      <Button
        mode="contained"
        onPress={handlePay}
        loading={isProcessing} // Muestra el spinner de React Native Paper
        disabled={isProcessing}
        style={{ marginTop: 24, borderRadius: 8 }}
        contentStyle={{ paddingVertical: 8 }}
      >
        {isProcessing ? "Procesando..." : "Pagar Kit"}
      </Button>
    </ScrollView>
  );
};

export default CheckoutScreen;
