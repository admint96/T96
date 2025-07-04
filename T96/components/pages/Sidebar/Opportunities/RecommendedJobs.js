import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimeStamp from '../../TimeStamp';
import {API_URL} from '../../../../config';

export default function RecommendedJobs() {
  const navigation = useNavigation();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserAndRecommended = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');

      
      const userRes = await fetch(`${API_URL}/api/users/userdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userRes.json();
      setUser(userData);

      const saved = Array.isArray(userData.savedJobs) ? userData.savedJobs : [];
      setSavedJobIds(saved);

     
      const recRes = await fetch(`${API_URL}/api/recruiters/recommended`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          designation: userData?.professionalDetails?.designation || '',
          skills: userData?.skills?.technologies || [],
          location: userData?.basicDetails?.location || '',
        }),
      });

      const recData = await recRes.json();
      setRecommendedJobs(Array.isArray(recData) ? recData : []);
    } catch (err) {
      console.error('Error fetching recommended jobs:', err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const toggleSaveJob = async (jobId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isSaved = savedJobIds.includes(jobId);
      const url = isSaved
        ? `${API_URL}/api/recruiters/unsave-job/${jobId}`
        : `${API_URL}/api/recruiters/save-job`;

      const method = isSaved ? 'DELETE' : 'POST';
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(method === 'POST' ? { body: JSON.stringify({ jobId }) } : {}),
      };

      const res = await fetch(url, options);
      if (res.ok) {
        setSavedJobIds((prev) =>
          isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
      }
    } catch (err) {
      console.error('Error saving job:', err.message);
    }
  };

  useEffect(() => {
    fetchUserAndRecommended();
  }, []);

  const renderJobCard = (job) => (
    <TouchableOpacity
      key={job._id}
      style={styles.card}
      onPress={() => navigation.navigate('jobcard', { job })}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.jobTitle}</Text>
          <Text style={styles.company}>{job.companyName}</Text>
          <View style={styles.rowInfo}>
            <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
            <Text style={styles.rowText}> {job.experience || '1-3 Yrs'}</Text>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
            <Text style={styles.rowText}>{job.location}</Text>
          </View>
          <Text style={styles.description}>{job.description?.slice(0, 70)}...</Text>
          <View style={styles.skills}>
            {(job.skills || []).slice(0, 3).map((skill, i) => (
              <View key={i} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <TimeStamp date={job.postedAt} />
            <TouchableOpacity onPress={() => toggleSaveJob(job._id)}>
              <Ionicons
                name={savedJobIds.includes(job._id) ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={savedJobIds.includes(job._id) ? '#6495ED' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Image
          source={{ uri: job.companyLogo || 'https://placehold.co/48x48' }}
          style={styles.logo}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Recommended Jobs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 20 }} />
      ) : recommendedJobs.length === 0 ? (
        <Text style={styles.emptyText}>No recommended jobs found.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserAndRecommended} />}
        >
          {recommendedJobs.map(renderJobCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  company: { color: '#6B7280', marginVertical: 4 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowText: { color: '#4B5563', marginLeft: 4 },
  description: { color: '#6B7280', fontSize: 13, marginVertical: 4 },
  skills: { flexDirection: 'row', flexWrap: 'wrap' },
  skillTag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  skillText: { fontSize: 12, color: '#374151' },
  logo: { width: 48, height: 48, borderRadius: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#9CA3AF',
    fontSize: 16,
  },
});
