import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import EntryPage from './screens/EntryScreen';
import Map from './screens/HomePageMap';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Entry">
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
