import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import EntryPage from './screens/EntryScreen';
import Map from './screens/HomePageMap';
import signOut from './screens/utils/signOut';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Settings from './screens/Settings';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const shouldSignOutOnReload = false;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (shouldSignOutOnReload) {
          console.log('Signing out on app reload...');
          await signOut();
        }

        // Check for a valid token after potential sign-out
        const token = await AsyncStorage.getItem('spotifyAccessToken');
        setInitialRoute(token ? 'Map' : 'Login');
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading || initialRoute === null) {
    return null; // Optionally show a loading indicator
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Entry"
        component={EntryPage}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Map"
        component={Map}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SignUp" // Add the SignUp screen here
        component={SignUp}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
}
