import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons'; // Importación recomendada para Expo

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Provider as PaperProvider } from 'react-native-paper';
import { HelmetProvider } from 'react-helmet-async';

// Stripe Promise - Aseguramos un string vacío si la env no existe para evitar crashes
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepareFonts() {
      try {
        // Cargamos la familia de fuentes de Ionicons directamente del paquete
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn("Error cargando la fuente de Ionicons:", e);
      } finally {
        // Marcamos como cargado independientemente del error para no bloquear la app
        setFontsLoaded(true);
      }
    }

    prepareFonts();
  }, []);

  // Pantalla de carga mientras se preparan los assets
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2d6e91" /> 
      </View>
    );
  }

  return (
    <HelmetProvider>
      <PaperProvider>
        <AuthProvider>
          <Elements stripe={stripePromise}>
            <AppNavigator />
          </Elements>
        </AuthProvider>
      </PaperProvider>
    </HelmetProvider>
  );
}