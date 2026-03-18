// AppNavigator.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../components/NotificationContext';
import MainLayout from '../components/MainLayout';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens (with Navbar)
import HomeScreen from '../screens/home/HomeScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyArticlesScreen from '../screens/profile/MyArticlesScreen';
import MyKitsScreen from '../screens/profile/MyKitsScreen';
import MyServicesScreen from '../screens/service/MyServicesScreen';
import MyIncidentsScreen from '../screens/incidents/MyIncidentsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import MyKitsHistoryScreen from '../screens/kit/MyKitsHistoryScreen';
import UserRatingsScreen from '../screens/ratings/UserRatingsScreen';

// Detail/Creation Screens (without Navbar)
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UploadArticleScreen from '../screens/profile/UploadArticleScreen';
import CheckoutScreen from '../screens/kit/CheckoutScreen';
import CreateRatingScreen from '../screens/ratings/CreateRatingScreen';
import CreateKitScreen from '../screens/kit/CreateKitScreen';
import AdminUserFormScreen from '../screens/admin/AdminUserFormScreen';
import EditArticleScreen from '../screens/profile/EditArticleScreen';
import KitDetailScreen from '../screens/kit/KitDetailScreen';
import CategoryFormScreen from '../screens/category/CategoryFormScreen';
import CreateIncidentScreen from '../screens/incidents/CreateIncidentScreen';
import IncidentDetailScreen from '../screens/incidents/IncidentDetailScreen';
import CreateServiceScreen from '../screens/service/CreateServiceScreen'; 
import EditServiceScreen from '../screens/service/EditServiceScreen';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              {/* === PANTALLAS PRINCIPALES (CON NAVBAR) === */}
              
              {/* Home - Admin o User según rol */}
              <Stack.Screen name="Home">
                {() => (
                  <MainLayout>
                    {user.role === 'ADMIN' ? <AdminHomeScreen /> : <HomeScreen />}
                  </MainLayout>
                )}
              </Stack.Screen>

              {/* Perfil y listados principales */}
              <Stack.Screen name="Profile">
                {() => (
                  <MainLayout>
                    <ProfileScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="MyArticles">
                {() => (
                  <MainLayout>
                    <MyArticlesScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="MyKits">
                {() => (
                  <MainLayout>
                    <MyKitsScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="MyServices">
                {() => (
                  <MainLayout>
                    <MyServicesScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="MyKitsHistory">
                {() => (
                  <MainLayout>
                    <MyKitsHistoryScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="UserRatings">
                {() => (
                  <MainLayout>
                    <UserRatingsScreen />
                  </MainLayout>
                )}
              </Stack.Screen>

              {/* Pantallas de administración */}
              {user.role === 'ADMIN' && (
                <>
                  <Stack.Screen name="AdminUsers">
                    {() => (
                      <MainLayout>
                        <AdminUsersScreen />
                      </MainLayout>
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="Categories">
                    {() => (
                      <MainLayout>
                        <CategoriesScreen />
                      </MainLayout>
                    )}
                  </Stack.Screen>
                </>
              )}

              {/* === PANTALLAS SECUNDARIAS (SIN NAVBAR) === */}
              
              {/* Edición y formularios */}
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="UploadArticle" component={UploadArticleScreen} />
              <Stack.Screen name="EditArticle" component={EditArticleScreen} />
              <Stack.Screen name="CreateKit" component={CreateKitScreen} />
              <Stack.Screen name="PromoteService" component={CreateServiceScreen} />
              <Stack.Screen name="EditService" component={EditServiceScreen} />
              <Stack.Screen name="CreateIncident" component={CreateIncidentScreen} />
              <Stack.Screen name="AdminUserForm" component={AdminUserFormScreen} />
              <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen name="MyIncidents" component={MyIncidentsScreen} />
              
              {/* Detalles y checkout */}
              <Stack.Screen name="KitDetail" component={KitDetailScreen} />
              <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="CreateRating" component={CreateRatingScreen} />
            </>
          ) : (
            /* === PANTALLAS PÚBLICAS === */
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default AppNavigator;