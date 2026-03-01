import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import HomeScreen           from '../screens/home/HomeScreen';
import MyArticlesScreen     from '../screens/profile/MyArticlesScreen';
import UploadArticleScreen  from '../screens/profile/UploadArticleScreen';
import CreateRatingScreen   from '../screens/ratings/CreateRatingScreen';
import UserRatingsScreen    from '../screens/ratings/UserRatingsScreen';
import CreateKitScreen      from '../screens/kit/CreateKitScreen';

import { RootStackParamList } from '../types';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import CategoryFormScreen from '../screens/category/CategoryFormScreen';

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home"          component={HomeScreen} />
            <Stack.Screen name="MyArticles"    component={MyArticlesScreen} />
            <Stack.Screen name="UploadArticle" component={UploadArticleScreen} />
            <Stack.Screen name="CreateRating"  component={CreateRatingScreen} />
            <Stack.Screen name="UserRatings"   component={UserRatingsScreen} />
            <Stack.Screen name="CreateKit"     component={CreateKitScreen} />
            <Stack.Screen name="Categories"     component={CategoriesScreen} />
            <Stack.Screen name="CategoryForm"     component={CategoryFormScreen} />

          </>
        ) : (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;