import {React, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {collection, getDocs, addDoc} from 'firebase/firestore';
import { db } from '../index';

export default function LoginScreen({ navigation }) {

  //TEST FUNCTION -- Fetch users from database after clicking "Sign Up Button"
  const fetchUserData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
    // Process each document in the collection
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
      // You can also save data to state or perform other operations here
    });
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
}

//TEST FUNCTION -- Store fake user to database after clicking "Sign Up Button"
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

  return (
    <View style={styles.container}>
      {/* Cropped Logo GIF */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo/SoundScout.gif')}
          style={styles.logo}
        />
      </View>

      {/* Bottom Button Container */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.signUpButton} onPress={addFakeUser}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.subText}>Already have an account?</Text>

        <TouchableOpacity onPress={() => {navigation.navigate('SignIn')}}>
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
