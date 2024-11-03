import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Cropped Logo GIF */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo/SoundScout.gif')}
          style={styles.logo}
        />
      </View>

      {/* Bottom Button Container */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.subText}>Already have an account?</Text>

        <TouchableOpacity onPress={() => {/* Navigate or sign-in logic */}}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#93CE89',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    resizeMode: 'cover',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    start: 20,
    end: 20,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#CA5038',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
  },
  subText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  signInText: {
    color: '#CA5038',
    textAlign: 'center',
  },
});
