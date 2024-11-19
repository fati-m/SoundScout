import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../index';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  // TEST FUNCTION -- Fetch users from database after clicking "Sign Up Button"
  const fetchUserData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      // Process each document in the collection
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
      });
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  // TEST FUNCTION -- Store fake user to database after clicking "Sign Up Button"
  const addFakeUser = async () => {
    try {
      // Define a fake user object
      const fakeUser = {
        name: "John Adaams",
        email: "admas123@example.com",
        password: "anotherpassword", // You should hash passwords in a real app, this is for testing
        createdAt: new Date(),  // Add timestamp of when the user was created
      };

      // Add the fake user to the 'users' collection in Firestore
      const docRef = await addDoc(collection(db, 'users'), fakeUser);
      console.log("Fake user added with ID: ", docRef.id);  // Log the document ID

    } catch (error) {
      console.error("Error adding fake user: ", error);
    }
  };

  // Handle Sign-In Authentication
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Signed in as: ", user.email);
      Alert.alert("Login Success", `Welcome back, ${user.email}`);
      navigation.navigate('Home'); // Navigate to the Home screen on successful login
    } catch (error) {
      console.error("Error signing in: ", error.message);
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cropped Logo GIF */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo/SoundScout.gif')}
          style={styles.logo}
        />
      </View>

      {/* Email and Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Already have an account? Sign up link */}
      <Text style={styles.subText}>Don't have an account?</Text>
      <TouchableOpacity onPress={() => { navigation.navigate('SignUp'); }}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Example Buttons for Fetching and Adding Fake Users */}
      <TouchableOpacity style={styles.exampleButton} onPress={fetchUserData}>
        <Text style={styles.buttonText}>Fetch Users</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exampleButton} onPress={addFakeUser}>
        <Text style={styles.buttonText}>Add Fake User</Text>
      </TouchableOpacity>
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
  input: {
    width: '90%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  signInButton: {
    backgroundColor: '#CA5038',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  subText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  signUpText: {
    color: '#CA5038',
    textAlign: 'center',
  },
  exampleButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
});

