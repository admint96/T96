import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/logo2.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Talent96</Text>
       
      </View>

      {/* Subtitle */}
      <Text style={styles.continueAs}>Continue as</Text>
      <Text style={styles.subText}>
        Explore thousands of job opportunities or find the best candidates tailored for your company.
      </Text>

      {/* Role Selection Cards */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Login', { role: 'jobSeeker' })}
        >
          <View>
            <Text style={styles.cardTitle}>JOB SEEKERS</Text>
            <Text style={styles.cardDesc}>
              Finding a job has never been easier. Discover roles that match your skills.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Login', { role: 'recruiter' })}
        >
          <View>
            <Text style={styles.cardTitle}>RECRUITER</Text>
            <Text style={styles.cardDesc}>
              Streamline your hiring process and recruit top talent faster and smarter.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8F3FF' },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: { fontSize: 26, fontWeight: 'bold', marginTop: 12, color: '#000' },
  appDesc: { color: '#666', fontSize: 14, marginTop: 4 },
  continueAs: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#000',
    textAlign: 'left',
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'left',
    paddingHorizontal: 12,
  },
  cardContainer: {
    gap: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#5A1EFF' },
  cardDesc: { color: '#444', fontSize: 12, marginTop: 4, maxWidth: '90%' },
});

export default RoleSelectionScreen;
