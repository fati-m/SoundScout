import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LoginScreen from './LoginScreen';

export default function EntryPage({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Navigate to the next screen
    }, 4000); // Set the delay time in milliseconds (3000ms = 3 seconds)

    // Clear the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
        {/* Cropped Logo GIF */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo/SoundScout.gif')}
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#93CE89',
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});