import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Provider as PaperProvider } from 'react-native-paper';

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Elements stripe={stripePromise}>
          <AppNavigator />
        </Elements>
      </AuthProvider>
    </PaperProvider>
  );
}