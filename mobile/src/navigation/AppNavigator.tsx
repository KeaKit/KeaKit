import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { TrackingNotificationsProvider } from "../context/TrackingNotificationContext";
import { RootStackParamList } from "../types";

import { NotificationProvider } from "../components/NotificationContext";
import MainLayout from "../components/MainLayout";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Home
import HomeScreen from "../screens/home/HomeScreen";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";

// Users and Profile
import ProfileScreen from "../screens/profile/ProfileScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import PilotUsersScreen from "../screens/admin/PilotUsersScreen";
import AdminUserFormScreen from "../screens/admin/AdminUserFormScreen";

// Kits
import MyKitsScreen from "../screens/profile/MyKitsScreen";
import MyKitsHistoryScreen from "../screens/kit/MyKitsHistoryScreen";
import KitTrackingScreen from "../screens/kit/KitTrackingScreen";
import KitDetailScreen from "../screens/kit/KitDetailScreen";
import CreateKitScreen from "../screens/kit/CreateKitScreen";

// Incidents
import MyIncidentsScreen from "../screens/incidents/MyIncidentsScreen";
import AdminIncidentsScreen from "../screens/admin/AdminIncidentsScreen";
import CreateIncidentScreen from "../screens/incidents/CreateIncidentScreen";
import IncidentDetailScreen from "../screens/incidents/IncidentDetailScreen";

// Payment and Wallet
import WalletScreen from "../screens/wallet/WalletScreen";
import WithdrawMoneyScreen from "../screens/wallet/WithdrawMoneyScreen";
import CheckoutScreen from "../screens/kit/CheckoutScreen";

// Categories
import CategoriesScreen from "../screens/category/CategoriesScreen";
import CategoryFormScreen from "../screens/category/CategoryDetailsScreen";

// Ratings
import UserRatingsScreen from "../screens/ratings/UserRatingsScreen";
import CreateRatingScreen from "../screens/ratings/CreateRatingScreen";

// Commission
import CommissionScreen from "../screens/commission/CommissionScreen";

// Couriers
import CouriersScreen from "../screens/admin/CouriersScreen";
import CourierDetailScreen from "../screens/admin/CourierDetailScreen";
import AssignedKitsScreen from "../screens/kit/AssignedKitsScreen";

// Promo codes
import PromoCodesScreen from "../screens/admin/PromoCodesScreen";
import PromoCodeFormScreen from "../screens/admin/PromoCodeFormScreen";

// Notifications
import ActivityNotificationsScreen from "../screens/notifications/ActivityNotificationsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import TrackingNotificationsScreen from "../screens/notifications/TrackingNotificationsScreen";

// Articles
import MyArticlesScreen from "../screens/profile/MyArticlesScreen";
import ArticleRentalsScreen from "../screens/article/ArticleRentalsScreen";
import RgpdPolicyScreen from "../screens/legal/RgpdPolicyScreen";
import EditPolicyScreen from "../screens/admin/EditPolicyScreen";
import UploadArticleScreen from "../screens/profile/UploadArticleScreen";
import EditArticleScreen from "../screens/profile/EditArticleScreen";

// Services
import MyServicesScreen from "../screens/service/MyServicesScreen";
import CreateServiceScreen from "../screens/service/CreateServiceScreen";
import EditServiceScreen from "../screens/service/EditServiceScreen";

// Default kits
import DefaultKitsScreen from "../screens/defaultKit/tenant/DefaultKitsScreen";
import DefaultKitFormScreen from "../screens/defaultKit/admin/DefaultKitFormScreen";
import DefaultKitDetailScreen from "../screens/defaultKit/tenant/DefaultKitDetailsScreen";
import CourierHomeScreen from "../screens/courier/CourierHomeScreen";


const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const withLayout = (Component: React.ComponentType<any>) => {
    return () => (
      <MainLayout>
        <Component />
      </MainLayout>
    );
  };

  const withLayoutAndRole = (
      AdminComponent: React.ComponentType<any>,
      CourierComponent: React.ComponentType<any>,
      UserComponent: React.ComponentType<any>,
      userRole: string,
    ) => {
      return () => (
        <MainLayout>
          {userRole === "ADMIN" ? (
            <AdminComponent />
          ) : userRole === "COURIER" ? (
            <CourierComponent />
          ) : (
            <UserComponent />
          )}
        </MainLayout>
      );
  };

  return (
    <NotificationProvider>
      <TrackingNotificationsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen
                  name="Home"
                  component={withLayoutAndRole(
                    AdminHomeScreen,
                    CourierHomeScreen,
                    HomeScreen,
                    user.role,
                  )}
                />

                <Stack.Screen
                  name="DefaultKits"
                  component={withLayout(
                    DefaultKitsScreen
                  )}
                />
                <Stack.Screen
                  name="DefaultKitDetails"
                  component={DefaultKitDetailScreen}
                />

                <Stack.Screen
                  name="Profile"
                  component={withLayout(ProfileScreen)}
                />

                <Stack.Screen
                  name="MyArticles"
                  component={withLayout(MyArticlesScreen)}
                />

                <Stack.Screen
                  name="ArticleRentals"
                  component={withLayout(ArticleRentalsScreen)}
                />

                <Stack.Screen
                  name="MyKits"
                  component={withLayout(MyKitsScreen)}
                />

                <Stack.Screen
                  name="MyServices"
                  component={withLayout(MyServicesScreen)}
                />

                <Stack.Screen
                  name="MyIncidents"
                  component={withLayout(MyIncidentsScreen)}
                />

                <Stack.Screen
                  name="MyKitsHistory"
                  component={withLayout(MyKitsHistoryScreen)}
                />

                <Stack.Screen
                  name="UserRatings"
                  component={withLayout(UserRatingsScreen)}
                />

                {/* Pantallas de administración */}
                {user.role === "ADMIN" && (
                  <>
                    <Stack.Screen
                      name="AdminUsers"
                      component={withLayout(AdminUsersScreen)}
                    />

                    <Stack.Screen
                      name="Categories"
                      component={withLayout(CategoriesScreen)}
                    />

                    <Stack.Screen
                      name="Commission"
                      component={withLayout(CommissionScreen)}
                    />

                    <Stack.Screen
                      name="PilotUsers"
                      component={withLayout(PilotUsersScreen)}
                    />

                    <Stack.Screen
                      name="PromoCodes"
                      component={withLayout(PromoCodesScreen)}
                    />

                    <Stack.Screen
                      name="Couriers"
                      component={withLayout(CouriersScreen)}
                    />

                    <Stack.Screen
                      name="AdminIncidents"
                      component={withLayout(AdminIncidentsScreen)}
                    />
                  </>
                )}

                {/* === PANTALLAS SECUNDARIAS (SIN NAVBAR) === */}

                {/* Edición de perfil */}
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                />

                {/* Artículos */}
                <Stack.Screen
                  name="UploadArticle"
                  component={UploadArticleScreen}
                />
                <Stack.Screen
                  name="EditArticle"
                  component={EditArticleScreen}
                />

                {/* Servicios */}
                <Stack.Screen
                  name="PromoteService"
                  component={CreateServiceScreen}
                />
                <Stack.Screen
                  name="EditService"
                  component={EditServiceScreen}
                />

                {/* Kits */}
                <Stack.Screen name="CreateKit" component={CreateKitScreen} />
                <Stack.Screen name="KitDetail" component={KitDetailScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen
                  name="DefaultKitForm"
                  component={DefaultKitFormScreen}
                />

                {/* Valoraciones */}
                <Stack.Screen
                  name="CreateRating"
                  component={CreateRatingScreen}
                />

                { /* Wallet */ }
                <Stack.Screen
                  name="Wallet"
                  component={WalletScreen}
                />

                {/* Incidencias */}
                <Stack.Screen
                  name="CreateIncident"
                  component={CreateIncidentScreen}
                />
                <Stack.Screen
                  name="IncidentDetail"
                  component={IncidentDetailScreen}
                />

                {/* Administración */}
                <Stack.Screen
                  name="AdminUserForm"
                  component={AdminUserFormScreen}
                />
                <Stack.Screen
                  name="CategoryForm"
                  component={CategoryFormScreen}
                />
                <Stack.Screen
                  name="WithdrawMoney"
                  component={WithdrawMoneyScreen}
                />
                <Stack.Screen 
                  name="EditPolicy" 
                  component={EditPolicyScreen} 
                />

                {/*Tracking - Delivery*/}

                <Stack.Screen name="Tracking" component={KitTrackingScreen} />

                <Stack.Screen
                  name="PromoCodeForm"
                  component={PromoCodeFormScreen}
                />

                <Stack.Screen
                  name="TrackingNotifications"
                  component={withLayout(TrackingNotificationsScreen)}
                />
                <Stack.Screen
                  name="ActivityNotifications"
                  component={withLayout(ActivityNotificationsScreen)}
                />
                <Stack.Screen name="Notifications">
                  {() => (
                    <MainLayout>
                      <NotificationsScreen />
                    </MainLayout>
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="AssignedKits"
                  component={AssignedKitsScreen}
                />
                <Stack.Screen
                  name="CourierDetail"
                  component={CourierDetailScreen}
                />
              </>
            ) : (
              /* === PANTALLAS PÚBLICAS === */
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="RgpdPolicy" component={RgpdPolicyScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </TrackingNotificationsProvider>
    </NotificationProvider>
  );
};

export default AppNavigator;
