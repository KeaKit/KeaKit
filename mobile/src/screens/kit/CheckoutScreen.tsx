import { Platform } from 'react-native';

const CheckoutScreen =
  Platform.OS === 'web'
    ? require('./CheckoutScreen.web').default
    : require('./CheckoutScreen.native').default;

export default CheckoutScreen;
