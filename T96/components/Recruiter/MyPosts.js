import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {API_URL} from '../../config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';
import { toastConfig } from '../pages/toastConfig'; 

const MyPosts = () => {
  const navigation = useNavigation();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchMyPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/recruiters/my-jobs`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('Fetched jobs:', data);
      if (response.ok) {
        setMyPosts(data?.jobs || []);
      } else {
        console.error('Failed to fetch jobs:', data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching job posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/recruiters/${jobToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok) {
        setMyPosts((prev) => prev.filter((job) => job._id !== jobToDelete));
        Toast.show({
          type: 'success',
          text1: 'Job Deleted',
          text2: 'The job has been removed successfully.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: result.message || 'Could not delete the job.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while deleting the job.',
      });
    } finally {
      setModalVisible(false);
      setJobToDelete(null);
    }
  };

  const confirmDelete = (jobId) => {
    setJobToDelete(jobId);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const renderItem = ({ item }) => {
    const applicants = item.applicants || [];

    const statusCounts = {
      all: applicants.filter(a => !['shortlist', 'maybe', 'reject'].includes(a.applicationStatus)).length,
      shortlist: applicants.filter(a => a.applicationStatus === 'shortlist').length,
      maybe: applicants.filter(a => a.applicationStatus === 'maybe').length,
      reject: applicants.filter(a => a.applicationStatus === 'reject').length,
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
  onPress={() =>
    navigation.navigate('JobApplicants', {
      jobId: item._id,
      companyName: item.companyName,   
      companyLogo: item.companyLogo,   
      refreshJobs: fetchMyPosts,
    })
  }
>


          <Text style={styles.title}>{item.jobTitle}</Text>
          <Text style={styles.detail}>📍 Location: {item.location}</Text>
          <Text style={styles.detail}>💰 Salary: {item.salary} LPA</Text>
          <Text style={styles.detail}>🧳 Experience: {item.experience}</Text>
          <Text style={styles.detail}>
            📢 Openings: {item.openings} | 👥 Applicants: {applicants.length}
          </Text>

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Shortlisted: {statusCounts.shortlist}</Text>
            <Text style={[styles.statusText, { color: '#FFC107' }]}>Maybe: {statusCounts.maybe}</Text>
            <Text style={[styles.statusText, { color: '#F44336' }]}>Rejected: {statusCounts.reject}</Text>
            <Text style={[styles.statusText, { color: '#2196F3' }]}>Pending: {statusCounts.all}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('PostJobs', { jobData: item })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => confirmDelete(item._id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <Text style={styles.heading}>My Job Posts</Text>
      </View>

      {myPosts.length === 0 ? (
        <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
      ) : (
        <FlatList
          data={myPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Are you sure you want to delete this job?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#E53935' }]}
              onPress={handleDeleteJob}
            >
              <Text style={{ color: '#fff' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast config={toastConfig} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9F9F9' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  detail: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
});

export default MyPosts;
