import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TimeStamp from '../../TimeStamp';

const ResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { results = [], designation = [], location = '', type = '' } = route.params || {};

  const renderJobCard = ({ item: job }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('jobcard', { job })}
      style={styles.jobCardWrapper}
    >
      <View style={styles.jobCardContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.jobTitle}</Text>
          <Text style={styles.companyInfo}>{job.companyName}</Text>
          <View style={styles.rowInfo}>
            <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
            <Text style={styles.rowText}> {job.experience || '1-3 Yrs'}</Text>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
            <Text style={styles.rowText}>{job.location}</Text>
          </View>
          <Text style={styles.description}>{job.description?.slice(0, 70)}...</Text>
          <View style={styles.skillsContainer}>
            {(job.skills || []).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <TimeStamp date={job.postedAt} />
          </View>
        </View>
        <Image
          source={{ uri: job.companyLogo || 'https://placehold.co/48x48' }}
          style={styles.logoImage}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Searched Jobs</Text>
      </View>

      
      <Text style={styles.heading}>
        Showing {type.toLowerCase()} jobs in {location || 'All Locations'}
      </Text>
      {designation.length > 0 && (
        <Text style={styles.subHeading}>Filters: {designation.join(', ')}</Text>
      )}

      
      {results.length === 0 ? (
        <Text style={styles.noResults}>No jobs found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backIcon: { marginRight: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    marginTop: 40,
    textAlign: 'center',
  },

  jobCardWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  jobCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  companyInfo: { color: '#6B7280', marginVertical: 4 },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowText: { color: '#4B5563', fontSize: 13 },
  description: { color: '#6B7280', fontSize: 13, marginVertical: 4 },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  skillText: { fontSize: 12, color: '#374151' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 50,
    height: 48,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: '#eee',
  },
});

export default ResultsScreen;
