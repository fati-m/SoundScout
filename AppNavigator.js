import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import EntryPage from './screens/EntryScreen';
import Map from './screens/HomePageMap';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Entry');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = await AsyncStorage.getItem('spotifyAccessToken');
        setInitialRoute(token ? 'Map' : 'Login');
      } catch (error) {
        console.error('Error checking session:', error);
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (isLoading) {
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
    </Stack.Navigator>
  );
}
