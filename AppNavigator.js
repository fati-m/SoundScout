import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SignInScreen from './src/screens/SignInScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
<Stack.Navigator initialRouteName="Login">
      {/* Login Screen */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}  // Hide the header for the login screen
      />
      
      {/* Sign In Screen */}
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ headerShown: false }}  // Hide the header for the sign-in screen
      />
    </Stack.Navigator>
  );
}
