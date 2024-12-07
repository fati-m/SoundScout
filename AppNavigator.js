import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import EntryPage from './screens/EntryScreen';
import Map from './screens/HomePageMap';
import SignUp from './screens/SignUp';
import Settings from './screens/Settings';
import Likes from './screens/Likes';
import AddToPlaylist from './screens/AddToPlaylist';
import Recommendations from './screens/Recommendations';
import Grid from './screens/HomePageGrid';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineInitialRoute = async () => {
      try {
        const userId = await AsyncStorage.getItem('spotifyUserId');
        if (userId) {
          const isGridView = await AsyncStorage.getItem('userData');
          const userData = isGridView ? JSON.parse(isGridView) : {};
          
          if(userData.isGridView){
            setInitialRoute('Grid')
          } else {
            setInitialRoute('Map');
          }
          
        } else {
          setInitialRoute('Entry');
        }
      } catch (error) {
        console.error('Error determining initial route:', error);
        setInitialRoute('Entry');
      } finally {
        setIsLoading(false);
      }
    };

    determineInitialRoute();
  }, []);

  if (isLoading || initialRoute === null) {
    return null;
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
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Likes"
        component={Likes}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AddToPlaylist"
        component={AddToPlaylist}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Recommendations"
        component={Recommendations}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Grid"
        component={Grid}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
}
