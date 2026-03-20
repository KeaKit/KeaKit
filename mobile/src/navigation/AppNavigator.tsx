import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../components/NotificationContext';
import CheckoutScreen from '../screens/kit/CheckoutScreen';
import LoginScreen       from '../screens/auth/LoginScreen';
import RegisterScreen    from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CreateRatingScreen from '../screens/ratings/CreateRatingScreen';
import UserRatingsScreen from '../screens/ratings/UserRatingsScreen';
import MyIncidentsScreen from '../screens/incidents/MyIncidentsScreen';
import CreateIncidentScreen from '../screens/incidents/CreateIncidentScreen';
import IncidentDetailScreen from '../screens/incidents/IncidentDetailScreen';
import MyArticlesScreen from '../screens/profile/MyArticlesScreen';
import MyKitsScreen from '../screens/profile/MyKitsScreen';
import UploadArticleScreen  from '../screens/profile/UploadArticleScreen';
import CreateKitScreen from '../screens/kit/CreateKitScreen';
import DefaultKitsScreen from '../screens/kit/DefaultKitsScreen';
import EditDefaultKitScreen from '../screens/kit/EditDefaultKitScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserFormScreen from '../screens/admin/AdminUserFormScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import { RootStackParamList } from '../types';
import EditArticleScreen from '../screens/profile/EditArticleScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import CommissionScreen from '../screens/commission/CommissionScreen';

import KitDetailScreen from '../screens/kit/KitDetailScreen';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import CategoryFormScreen from '../screens/category/CategoryFormScreen';
import MyServicesScreen from '../screens/service/MyServicesScreen';
import CreateServiceScreen from '../screens/service/CreateServiceScreen';
import EditServiceScreen from '../screens/service/EditServiceScreen';
import DefaultKitFormScreen from '../screens/deafaultKit/DefaultKitFormScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import MyKitsHistoryScreen from '../screens/kit/MyKitsHistoryScreen';

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
              {user.role === 'ADMIN' ? (
                <Stack.Screen name="Home" component={AdminHomeScreen} />
              ) : (
                <Stack.Screen name="Home" component={HomeScreen} />
              )}
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="MyArticles"    component={MyArticlesScreen} />
              <Stack.Screen name="MyKits"    component={MyKitsScreen} />
              <Stack.Screen name="UploadArticle" component={UploadArticleScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="CreateRating"  component={CreateRatingScreen} />
              <Stack.Screen name="UserRatings"   component={UserRatingsScreen} />
              <Stack.Screen name="CreateKit"     component={CreateKitScreen} />
              <Stack.Screen name="DefaultKits" component={DefaultKitsScreen} />
              <Stack.Screen name="EditDefaultKit" component={EditDefaultKitScreen} />
              <Stack.Screen name="AdminUsers"    component={AdminUsersScreen} />
              <Stack.Screen name="AdminUserForm" component={AdminUserFormScreen} />
              <Stack.Screen name="Commission" component={CommissionScreen} />
              <Stack.Screen name="EditArticle" component={EditArticleScreen} />
              <Stack.Screen name="KitDetail" component={KitDetailScreen} />
              <Stack.Screen name="Categories" component={CategoriesScreen} />
              <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
              <Stack.Screen name="MyIncidents" component={MyIncidentsScreen} />
              <Stack.Screen name="CreateIncident" component={CreateIncidentScreen} />
              <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
              <Stack.Screen name="MyServices"    component={MyServicesScreen} />
              <Stack.Screen name="PromoteService"    component={CreateServiceScreen} />
              <Stack.Screen name="EditService"    component={EditServiceScreen} />
              <Stack.Screen name="DefaultKitForm"    component={DefaultKitFormScreen} />

              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen name="MyKitsHistory" component={MyKitsHistoryScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login"    component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default AppNavigator;