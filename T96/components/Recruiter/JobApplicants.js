import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const FILTERS = ['All', 'Shortlisted', 'Maybe', 'Rejected'];

const JobApplicants = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId, refreshJobs, companyName, companyLogo } = route.params;

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    fetchApplicants();

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (refreshJobs) refreshJobs();
    });

    return unsubscribe;
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/recruiters/job-applicants/${jobId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setApplicants(data?.applicants || []);
      } else {
        console.error('Failed to fetch applicants:', data.message);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicantId, status) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/recruiters/${jobId}/applicants/${applicantId}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            companyName, 
            companyLogo, 
          }),
        }
      );

      if (response.ok) {
        await fetchApplicants();
        if (refreshJobs) refreshJobs();
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const statusCounts = {
    All: applicants.filter(a => !['shortlist', 'maybe', 'reject'].includes(a.applicationStatus)).length,
    Shortlisted: applicants.filter(a => a.applicationStatus === 'shortlist').length,
    Maybe: applicants.filter(a => a.applicationStatus === 'maybe').length,
    Rejected: applicants.filter(a => a.applicationStatus === 'reject').length,
  };

  const filteredApplicants = applicants.filter(applicant => {
    if (selectedFilter === 'All') {
      return !['shortlist', 'maybe', 'reject'].includes(applicant.applicationStatus);
    }
    const map = {
      Shortlisted: 'shortlist',
      Maybe: 'maybe',
      Rejected: 'reject',
    };
    return applicant.applicationStatus === map[selectedFilter];
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ApplicantDetails', { applicantId: item.userId })}
      >
        <View style={styles.row}>
          <Image
            source={{ uri: item.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>📧 {item.email}</Text>
            <Text style={styles.detail}>📍 {item.address}</Text>
            <Text style={styles.detail}>🕒 Applied: {new Date(item.appliedAt).toLocaleString()}</Text>

            {item.resume && item.resume.startsWith('http') ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.resume)} style={styles.resumeButton}>
                <Text style={styles.resumeText}>📄 View Resume</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.detail, { color: '#999' }]}>No resume uploaded</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.statusButtons}>
        <TouchableOpacity
          style={[styles.statusBtn, { backgroundColor: '#4CAF50' }]}
          onPress={() => updateStatus(item.userId, 'shortlist')}
        >
          <Text style={styles.btnText}>Shortlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, { backgroundColor: '#FFC107' }]}
          onPress={() => updateStatus(item.userId, 'maybe')}
        >
          <Text style={styles.btnText}>Maybe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, { backgroundColor: '#F44336' }]}
          onPress={() => updateStatus(item.userId, 'reject')}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A1EFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.heading}>Applicants</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
              {filter} ({statusCounts[filter]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredApplicants.length === 0 ? (
        <Text style={styles.emptyText}>No applicants found.</Text>
      ) : (
        <FlatList
          data={filteredApplicants}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingTop: 16 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: { padding: 4 },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    width: '23%',
    paddingVertical: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#5A1EFF',
  },
  filterText: {
    fontSize: 13,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detail: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  resumeButton: {
    marginTop: 6,
  },
  resumeText: {
    color: '#1E88E5',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default JobApplicants;
