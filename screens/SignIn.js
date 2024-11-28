// NO LONGER USING THIS FILE BUT KEEPING HERE JUST IN CASE

// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     Image,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     KeyboardAvoidingView,
//     ScrollView,
//     Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { signInWithEmailAndPassword } from './utils/backendUtils';

// export default function SignIn({ navigation }) {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');

//     const handleSignIn = async () => {
//         setErrorMessage(""); // Clear previous errors

//         if (!email || !password) {
//             setErrorMessage("Email and/or password were incorrect. Try again.");
//             return;
//         }

//         try {
//             // Call the backend to sign in the user
//             const userData = await signInWithEmailAndPassword(email, password);

//             try {
//                 // Ensure Spotify data (refresh token if needed)
//                 const spotifyData = await ensureSpotifyDataForReturningUser();
//                 console.log("Spotify Data:", spotifyData);

//                 // Save user ID to AsyncStorage
//                 await AsyncStorage.setItem("spotifyUserId", userData.id);

//                 // Navigate to the home page with Spotify data
//                 navigation.navigate("Map", { spotifyData });
//             } catch (spotifyError) {
//                 console.warn("Spotify Error:", spotifyError.message);

//                 // If reauthorization is required, show a message
//                 setErrorMessage("Spotify authorization is required. Please sign in again.");
//             }
//         } catch (error) {
//             console.error("Sign-In Error:", error.message);
//             setErrorMessage("Something went wrong. Please try again.");
//         }
//     };

//     return (
//         <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         >
//             <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
//                 <View style={styles.container}>
//                     {/* Back Button */}
//                     <View style={styles.headerContainer}>
//                         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//                             <Text style={styles.backButtonText}>&lt; Back</Text>
//                         </TouchableOpacity>
//                     </View>

//                     <View style={styles.contentContainer}>
//                         {/* App Logo */}
//                         <Image
//                             source={require('../assets/logo/SoundScout.gif')}
//                             style={styles.logo}
//                         />

//                         <Text style={styles.header}>Sign In</Text>

//                         {/* Email Input */}
//                         <Text style={styles.label}>Email</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={email}
//                             onChangeText={setEmail}
//                             placeholder="Enter your email"
//                             keyboardType="email-address"
//                             autoCapitalize="none"
//                         />

//                         {/* Password Input */}
//                         <Text style={styles.label}>Password</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={password}
//                             onChangeText={setPassword}
//                             placeholder="Enter your password"
//                             secureTextEntry
//                         />

//                         {/* Error Message */}
//                         {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

//                         {/* Submit Button */}
//                         <TouchableOpacity style={styles.submitButton} onPress={handleSignIn}>
//                             <Text style={styles.submitButtonText}>Sign In</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// }

// const styles = StyleSheet.create({
//     scrollContainer: {
//         flexGrow: 1,
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#F8EEDF',
//         paddingHorizontal: 20,
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         justifyContent: 'flex-start',
//         paddingVertical: 10,
//     },
//     backButton: {
//         paddingTop: 40,
//         paddingHorizontal: 10,
//     },
//     backButtonText: {
//         color: '#CA5038',
//         fontWeight: 'bold',
//         fontSize: 24,
//     },
//     contentContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//     },
//     header: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 15,
//         alignSelf: 'flex-start',
//     },
//     logo: {
//         height: 200,
//         marginBottom: 20,
//         resizeMode: 'contain',
//     },
//     label: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginBottom: 8,
//         alignSelf: 'flex-start',
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 5,
//         padding: 10,
//         width: '100%',
//         marginBottom: 20,
//     },
//     error: {
//         color: 'red',
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     submitButton: {
//         backgroundColor: '#28A745',
//         padding: 15,
//         borderRadius: 5,
//         alignItems: 'center',
//         marginBottom: 15,
//         width: '100%',
//     },
//     submitButtonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
// });