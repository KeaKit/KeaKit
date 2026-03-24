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
import AdminIncidentsScreen from '../screens/admin/AdminIncidentsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import MyKitsHistoryScreen from '../screens/kit/MyKitsHistoryScreen';
import UserRatingsScreen from '../screens/ratings/UserRatingsScreen';
import CommissionScreen from '../screens/commission/CommissionScreen';
import DefaultKitsScreen from '../screens/kit/DefaultKitsScreen';

// Detail/Creation Screens (without Navbar)
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UploadArticleScreen from '../screens/profile/UploadArticleScreen';
import CheckoutScreen from '../screens/kit/CheckoutScreen';
import CreateRatingScreen from '../screens/ratings/CreateRatingScreen';
import CreateKitScreen from '../screens/kit/CreateKitScreen';
import EditDefaultKitScreen from '../screens/kit/EditDefaultKitScreen';
import DefaultKitFormScreen from '../screens/deafaultKit/DefaultKitFormScreen';
import AdminUserFormScreen from '../screens/admin/AdminUserFormScreen';
import EditArticleScreen from '../screens/profile/EditArticleScreen';
import KitDetailScreen from '../screens/kit/KitDetailScreen';
import CategoryFormScreen from '../screens/category/CategoryFormScreen';
import CreateIncidentScreen from '../screens/incidents/CreateIncidentScreen';
import IncidentDetailScreen from '../screens/incidents/IncidentDetailScreen';
import CreateServiceScreen from '../screens/service/CreateServiceScreen';
import EditServiceScreen from '../screens/service/EditServiceScreen';
import KitTrackingScreen from '../screens/kit/KitTrackingScreen';
import { TrackingNotificationsProvider } from '../context/TrackingNotificationContext';
import TrackingNotificationsScreen from '../screens/notifications/TrackingNotificationsScreen';
import AssignedKitsScreen from '../screens/kit/AssignedKitsScreen';
import CouriersScreen from '../screens/admin/CouriersScreen';
import CourierDetailScreen from '../screens/admin/CourierDetailScreen';

import { RootStackParamList } from '../types';
import ArticleRentalsScreen from '../screens/article/ArticleRentalsScreen';

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
      <TrackingNotificationsProvider>

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

                <Stack.Screen name="ArticleRentals">
                  {() => (
                    <MainLayout>
                      <ArticleRentalsScreen />
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

                <Stack.Screen name="MyIncidents">
                  {() => (
                    <MainLayout>
                      <MyIncidentsScreen />
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

                <Stack.Screen name="Wallet">
                  {() => (
                    <MainLayout>
                      <WalletScreen />
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

                    <Stack.Screen name="Commission">
                      {() => (
                        <MainLayout>
                          <CommissionScreen />
                        </MainLayout>
                      )}
                    </Stack.Screen>

                    <Stack.Screen name="DefaultKits">
                      {() => (
                        <MainLayout>
                          <DefaultKitsScreen />
                        </MainLayout>
                      )}
                    </Stack.Screen>

                    <Stack.Screen name="Couriers">
                      {() => (
                        <MainLayout>
                          <CouriersScreen />
                        </MainLayout>
                      )}
                    </Stack.Screen>

                    <Stack.Screen name="AdminIncidents">
                      {() => (
                        <MainLayout>
                          <AdminIncidentsScreen />
                        </MainLayout>
                      )}
                    </Stack.Screen>
                  </>
                )}

                {/* === PANTALLAS SECUNDARIAS (SIN NAVBAR) === */}
                
                {/* Edición de perfil */}
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                
                {/* Artículos */}
                <Stack.Screen name="UploadArticle" component={UploadArticleScreen} />
                <Stack.Screen name="EditArticle" component={EditArticleScreen} />
                
                {/* Servicios */}
                <Stack.Screen name="PromoteService" component={CreateServiceScreen} />
                <Stack.Screen name="EditService" component={EditServiceScreen} />
                
                {/* Kits */}
                <Stack.Screen name="CreateKit" component={CreateKitScreen} />
                <Stack.Screen name="KitDetail" component={KitDetailScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="EditDefaultKit" component={EditDefaultKitScreen} />
                <Stack.Screen name="DefaultKitForm" component={DefaultKitFormScreen} />
                
                {/* Valoraciones */}
                <Stack.Screen name="CreateRating" component={CreateRatingScreen} />
                
                {/* Incidencias */}
                <Stack.Screen name="CreateIncident" component={CreateIncidentScreen} />
                <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
                
                {/* Administración */}
                <Stack.Screen name="AdminUserForm" component={AdminUserFormScreen} />
                <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />

                {/*Tracking - Delivery*/ }

                <Stack.Screen name="Tracking" component={KitTrackingScreen} />
                <Stack.Screen name="TrackingNotifications" component={TrackingNotificationsScreen} />
                <Stack.Screen name="AssignedKits" component={AssignedKitsScreen} />
                <Stack.Screen name="CourierDetail" component={CourierDetailScreen} />
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
      </TrackingNotificationsProvider>
    </NotificationProvider>
  );

};

export default AppNavigator;