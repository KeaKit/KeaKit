import { registerRootComponent } from 'expo';
import App from './App';
import { getUnauthorizedHandler } from './src/services/apiClient';

declare const global: any;

const originalFetch = global.fetch;

global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await originalFetch(input, init);
  if (res.status === 401) {
    getUnauthorizedHandler()?.();
  }
  return res;
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
