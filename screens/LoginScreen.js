import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("screen");

export default function LoginScreen({ navigation }) {
  const carouselItems = [
    {
      id: '1',
      title: 'Welcome to SoundScout!',
      subText: 'Step into a world where music is more than just sound—it\'s a journey. Explore fresh tracks from your local scene and beyond, handpicked for your unique taste. Whether it\'s indie vibes from a nearby café or the latest club beats, we\'ve got your next favorite song waiting.',
      image: require('../assets/logo/SoundScout.gif'),
      imageStyle: {
        width: 300,
        height: 200,
        resizeMode: 'cover',
      },
    },
    {
      id: '2',
      title: 'Discover, Like, Share!',
      subText: 'Dive into genres you know and uncover sounds you\'ve never imagined. Like what you hear? Show some love by liking tracks and creating a playlist of your new discoveries. Music is just the beginning—connect with fellow listeners and share the vibe.',
      image: require('../assets/logo/together3.jpg'),
      imageStyle: {
        width: 300,
        height: 200,
        borderRadius: 20,
        resizeMode: 'cover',
      },
    },
    {
      id: '3',
      title: 'Let’s Get Started',
      subText: 'Ready to discover your next favorite track? Let\'s dive in and explore the sounds around you. Join a world of music, connect with others, and make every beat count.',
      image: require('../assets/logo/together4.jpg'),
      imageStyle: {
        width: 300,
        height: 200,
        borderRadius: 20,
        resizeMode: 'cover',
      },
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewRef = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselItems.length;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <Image source={item.image} style={item.imageStyle} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subText1}>{item.subText}</Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        ref={flatListRef}
        data={carouselItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        contentContainerStyle={styles.flatListContainer}
      />

      <View style={styles.dotsContainer}>
        {carouselItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#CA5038' : '#ddd' },
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.subText}>Already have an account?</Text>

        <TouchableOpacity>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#93CE89',
    justifyContent: 'center',
  },
  flatListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.6, // Adjust height for proper placement
  },
  carouselItem: {
    width,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subText1: {
    marginTop: 10,
    fontSize: 16,
    width: width * 0.8,
    color: '#555',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: '#CA5038',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  subText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 10,
  },
  signInText: {
    color: '#CA5038',
    fontSize: 14,
  },
});