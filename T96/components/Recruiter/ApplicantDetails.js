import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';


const ApplicantDetails = () => {
  const route = useRoute();
  const { applicantId } = route.params;
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  console.log("app",applicantId);

  const fetchApplicant = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/recruiters/applicant/${applicantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log('Fetched applicant data:', data);
      if (res.ok) {
        setApplicant(data.applicant);
      }
    } catch (err) {
      console.error('Error fetching applicant:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicant();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5A1EFF" />
      </View>
    );
  }

  if (!applicant) {
    return <Text style={styles.error}>Applicant not found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <MaterialIcons name="arrow-back" size={28} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Applicant Details</Text>
</View>

      <Image source={{ uri: applicant.profileImage }} style={styles.avatar} />
      <Text style={styles.name}>{applicant.fullName}</Text>

      <TouchableOpacity onPress={() => Linking.openURL(`mailto:${applicant.email}`)}>
        <Text style={styles.email}>📧 {applicant.email}</Text>
      </TouchableOpacity>

      <Section title="📍 Address">
        <Text style={styles.text}>{applicant.personalDetails?.address || 'N/A'}</Text>
      </Section>

      <Section title="🎓 Education">
        {applicant.education.length > 0 ? (
          applicant.education.map((edu, i) => (
            <View key={i} style={styles.subItem}>
              <Text style={styles.text}>
                {edu.qualification} - {edu.college || edu.board}
              </Text>
              <Text style={styles.subText}>
                {edu.startYear} - {edu.endYear || edu.yearOfPassing}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No education details</Text>
        )}
      </Section>

      <Section title="💼 Employment">
        {applicant.employmentDetailsList.length > 0 ? (
          applicant.employmentDetailsList.map((emp, i) => (
            <View key={i} style={styles.subItem}>
              <Text style={styles.text}>{emp.jobTitle} at {emp.company}</Text>
              <Text style={styles.subText}>
                {emp.startDate} - {emp.isOngoing ? 'Present' : emp.endDate}
              </Text>
              <Text style={styles.subText}>Experience: {emp.experience}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No employment history</Text>
        )}
      </Section>

      <Section title="🧠 Skills">
        <Text style={styles.text}>{applicant.skills?.technologies?.join(', ') || 'No skills listed'}</Text>
      </Section>

      <Section title="🧍 Personal Details">
        <Text style={styles.text}>Gender: {applicant.personalDetails?.gender || 'N/A'}</Text>
        <Text style={styles.text}>DOB: {applicant.personalDetails?.dateOfBirth || 'N/A'}</Text>
        <Text style={styles.text}>Marital Status: {applicant.personalDetails?.maritalStatus || 'N/A'}</Text>
      </Section>

      <Section title="🌐 Languages">
        {applicant.personalDetails?.languages?.length > 0 ? (
          applicant.personalDetails.languages.map((lang, i) => (
            <Text key={i} style={styles.text}>
              {lang.language} - {lang.proficiency} (R:{lang.canRead ? '✔' : '❌'} W:{lang.canWrite ? '✔' : '❌'} S:{lang.canSpeak ? '✔' : '❌'})
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No language preferences listed</Text>
        )}
      </Section>

      <Section title="📎 Resume">
        {applicant.resume ? (
          <TouchableOpacity onPress={() => Linking.openURL(applicant.resume)}>
            <Text style={styles.resumeLink}>📄 View Resume</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.text}>No resume uploaded</Text>
        )}
      </Section>
    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={{ marginTop: 6 }}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
    header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},
backButton: {
  marginRight: 10,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
},

  container: { padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 110, height: 110, borderRadius: 55, alignSelf: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  email: {
    fontSize: 15,
    color: '#1E88E5',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  subItem: {
    marginBottom: 10,
  },
  resumeLink: {
    color: '#5A1EFF',
    fontSize: 15,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  error: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
});

export default ApplicantDetails;
