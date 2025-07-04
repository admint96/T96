import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../../../config';
import TimeStamp from '../../TimeStamp';
import Toast from 'react-native-toast-message';

export default function SavedJobs({ navigation }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'User not authenticated',
          position: 'top',
        });
        return;
      }

      const res = await fetch(`${API_URL}/api/recruiters/saved-jobs/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2: 'Could not fetch saved jobs',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSavedJobs();
  }, []);

  const handleRemoveSavedJob = async (jobId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/recruiters/unsave-job/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
        Toast.show({
          type: 'info',
          text1: 'Job Removed from Saved',
          text2: data.message || 'You have unsaved this job.',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Remove Job',
          text2: data.error || 'Something went wrong.',
          position: 'top',
        });
      }
    } catch (err) {
      console.error('Error removing saved job:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'top',
      });
    }
  };

  const renderJobCard = (job) => (
    <View key={job._id} style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigation.navigate('jobcard', { job })}
      >
        <Text style={styles.title}>{job.jobTitle}</Text>
        <Text style={styles.company}>{job.companyName}</Text>
        <View style={styles.row}>
          <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
          <Text style={styles.rowText}>{job.experience || '1-3 Yrs'}</Text>
          <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
          <Text style={styles.rowText}>{job.location}</Text>
        </View>
        <Text style={styles.desc}>{job.description?.slice(0, 70)}...</Text>
        <View style={styles.skills}>
          {(job.skills || []).slice(0, 3).map((skill, i) => (
            <View key={i} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <TimeStamp date={job.postedAt} />
        </View>
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <Image
          source={{ uri: job.companyLogo || 'https://placehold.co/48x48' }}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => handleRemoveSavedJob(job._id)}
          style={styles.unsaveButton}
        >
          <Ionicons name="bookmark-outline" size={20} color="#dc2626" />
          <Text style={styles.unsaveText}>Unsave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.header}>Saved Jobs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="purple" style={{ marginTop: 20 }} />
      ) : savedJobs.length === 0 ? (
        <Text style={styles.empty}>No saved jobs found.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {savedJobs.map(renderJobCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  scroll: { paddingBottom: 50 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  company: { color: '#6B7280', marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rowText: { color: '#4B5563', marginLeft: 4 },
  desc: { color: '#6B7280', marginVertical: 6 },
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
  footer: { marginTop: 10 },
  logo: { width: 48, height: 48, borderRadius: 8, marginBottom: 8 },
  rightSection: { justifyContent: 'space-between', alignItems: 'center', marginLeft: 10 },
  unsaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unsaveText: { color: '#dc2626', marginLeft: 4, fontSize: 12, fontWeight: '600' },
  empty: { color: 'gray', textAlign: 'center', marginTop: 50 },
});
