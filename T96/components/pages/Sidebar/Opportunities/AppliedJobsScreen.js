import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../../../config';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TimeStamp from '../../TimeStamp'; 

export default function AppliedJobsScreen() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigation = useNavigation();

  const fetchAppliedJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/recruiters/applied-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('Response from applied jobs:', data);
      setAppliedJobs(Array.isArray(data) ? data : []);
      console.log('Fetched applied jobs:', data);
    } catch (err) {
      console.error('Error fetching applied jobs:', err.message);
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#6b21a8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Applications</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {appliedJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No applied jobs yet</Text>
            <Text style={styles.suggestion}>Start applying to jobs that match your skills</Text>
          </View>
        ) : (
          appliedJobs.map((job) => <JobCard key={job._id} job={job} navigation={navigation} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function JobCard({ job, navigation }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('jobcard', { job })}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{job.jobTitle}</Text>
          <Text style={styles.company}>{job.companyName}</Text>
          

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}> {job.experience || '1-3 Yrs'}</Text>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
            <Text style={styles.infoText}>{job.location}</Text>
          </View>

          <Text style={styles.desc}>{job.description?.slice(0, 70)}...</Text>

          <View style={styles.skillsContainer}>
            {(job.skills || []).slice(0, 3).map((skill, index) => (
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
          style={styles.logo}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    color: '#6b21a8',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 12,
  },
  suggestion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  company: { color: '#6B7280', fontSize: 14, marginVertical: 4 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 6,
    color: '#4B5563',
    fontSize: 13,
  },
  desc: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  skillTag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#000',
  },
  footer: {
    marginTop: 10,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: '#ccc',
  },
});