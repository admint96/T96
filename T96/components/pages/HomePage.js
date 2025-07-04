import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';     
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TimeStamp from './TimeStamp';
import SideDrawer from './Sidebar';
import {API_URL} from '../../config';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo'; 
import NetworkHandler from './NetworkHandler';


export default function HomePage() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [latestJobs, setLatestJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useState(new Animated.Value(-250))[0];
  const [networkError, setNetworkError] = useState(false);

  
  


  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    } else {
      setIsDrawerOpen(true);
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };


   const [unreadCount, setUnreadCount] = useState(0);

const fetchUnreadCount = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const res = await fetch(`${API_URL}/api/notifications/${userId}`);
    const notifications = await res.json();
    const unread = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  } catch (err) {
    console.error('Fetch unread count error:', err);
  }
};

useEffect(() => {
  fetchUnreadCount();
}, []);


  const fetchUserData = async () => {
console.log('API URL:', API_URL);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/users/userdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      setUser(data);
      setSavedJobIds(Array.isArray(data.savedJobs) ? data.savedJobs : []);
    } catch (e) {
      console.error('User fetch error:', e);
    }
  };

  const fetchJobStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/recruiters/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTotalJobs(data.total || 0);
    } catch (err) {
      console.error('Job stats fetch error:', err);
    }
  };

  const fetchLatestJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/recruiters/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLatestJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Latest jobs fetch error:', err);
    }
  };

  const fetchAppliedCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/recruiters/applied/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAppliedCount(data.count || 0);
    } catch (err) {
      console.error('Applied count fetch error:', err);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !user) return;
      const res = await fetch(`${API_URL}/api/recruiters/recommended`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          designation: user?.professionalDetails?.designation || '',
          skills: user?.skills?.technologies || [],
          location: user?.basicDetails?.location || '',
        }),
      });
      const data = await res.json();
      setRecommendedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Recommended jobs fetch error:', err);
    }
  };


  const fetchData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserData(),
      fetchJobStats(),
      fetchLatestJobs(),
      fetchAppliedCount(),
    ]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveJob = async (jobId) => {
    const token = await AsyncStorage.getItem('token');
    const isSaved = savedJobIds.includes(jobId);
    const url = isSaved
      ? `${API_URL}/api/recruiters/unsave-job/${jobId}`
      : `${API_URL}/api/recruiters/save-job`;
    const method = isSaved ? 'DELETE' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(method === 'POST' ? { body: JSON.stringify({ jobId }) } : {}),
    });
    if (res.ok) {
      setSavedJobIds((prev) =>
        isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      );
      Toast.show({
        type: isSaved ? 'info' : 'success',
        text1: isSaved ? 'Job Removed from Saved' : 'Job Saved',
        text2: isSaved
          ? 'You have unsaved this job.'
          : 'Job has been saved successfully.',
        position: 'top',
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: 'Something went wrong. Please try again.',
        position: 'top',
      });
    }
  };

  const fData = useCallback(async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setNetworkError(true);
      setLoading(false);
      return;
    }

    try {
      setNetworkError(false);
      setRefreshing(true);
      await fetchUserData();
      await fetchJobStats();
      await fetchLatestJobs();
      await fetchAppliedCount();
    } catch (error) {
      console.error('Network or fetch error:', error);
      setNetworkError(true);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  
 useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      
      setNetworkError(false);
      fetchData();
    } else {
      
      setNetworkError(true);
    }
  });

  return () => unsubscribe();
}, [fetchData]);


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) fetchRecommendedJobs();
  }, [user]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setSuggestions([]);
    } else {
      const matches = latestJobs.filter((job) =>
        job.jobTitle.toLowerCase().includes(searchText.toLowerCase())
      );
      setSuggestions(matches);
    }
  }, [searchText]);

  const username = user?.fullName || 'Guest';

  
  const renderRecommendedJobCard = (job) => {
    const displayedSkills = (job.Skills || job.skills || []).slice(0, 2);
    const hasMoreSkills = (job.Skills || job.skills || []).length > 2;

    return (
      
      <TouchableOpacity
        key={job._id}
        onPress={() => navigation.navigate('jobcard', { job })}
        style={styles.recommendedJobCardWrapper}
      >
        <View style={styles.recommendedJobCardContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: job.companyLogo || 'https://placehold.co/48x48 ' }}
              style={styles.logoImage}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recommendedJobTitle}>{job.jobTitle}</Text>
            <Text style={styles.recommendedCompanyInfo}>{job.companyName}</Text>
            <View style={styles.rowInfo}>
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text style={styles.rowText}> {job.experience || '1-3 Yrs'}</Text>
              <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
              <Text style={styles.rowText}>{job.location}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
            <View style={styles.skillsContainer}>
              {displayedSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {hasMoreSkills && (
                <View style={styles.skillTag}>
                  <Text style={styles.skillText}>...</Text>
                </View>
              )}
            </View>
            <TimeStamp date={job.postedAt} />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={() => saveJob(job._id)}>
            <Ionicons
              name={savedJobIds.includes(job._id) ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={savedJobIds.includes(job._id) ? '#6495ED' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  
  const renderRecentJobCard = (job) => {
    const displayedSkills = (job.Skills || job.skills || []).slice(0, 2);
    const hasMoreSkills = (job.Skills || job.skills || []).length > 2;

    return (
      <TouchableOpacity
        key={job._id}
        onPress={() => navigation.navigate('jobcard', { job })}
        style={styles.recentJobCardWrapper}
      >
        <View style={styles.recentJobCardContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: job.companyLogo || 'https://placehold.co/48x48 ' }}
              style={styles.logoImage}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recentJobTitle}>{job.jobTitle}</Text>
            <Text style={styles.recentCompanyInfo}>{job.companyName}</Text>
            <View style={styles.rowInfo}>
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text style={styles.rowText}> {job.experience || '1-3 Yrs'}</Text>
              <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
              <Text style={styles.rowText}>{job.location}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
            <View style={styles.skillsContainer}>
              {displayedSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {hasMoreSkills && (
                <View style={styles.skillTag}>
                  <Text style={styles.skillText}>...</Text>
                </View>
              )}
            </View>
            <TimeStamp date={job.postedAt} />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={() => saveJob(job._id)}>
            <Ionicons
              name={savedJobIds.includes(job._id) ? 'bookmark' : 'bookmark-outline'}
              size={30}
              color={savedJobIds.includes(job._id) ? '#6495ED' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
 <NetworkHandler fetchFunction={fData}>
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {isDrawerOpen && (
          <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
            <SideDrawer closeDrawer={toggleDrawer} />
          </Animated.View>
        )}
        {loading ? (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color="#6b21a8" />
  </View>
) : networkError ? (
  <View style={styles.errorContainer}>
    <Image
      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png' }}
      style={styles.errorImage}
    />
    <Text style={styles.errorText}>Network Connection Error</Text>
    <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
            keyboardShouldPersistTaps="handled"
          >
           
            <View style={styles.header}>
              <TouchableOpacity onPress={toggleDrawer}>
                <MaterialIcons name="menu" size={35} color="darkviolet" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.username}>Hi, {username}</Text>
              </View>
               <TouchableOpacity onPress={() => {
                setUnreadCount(0);
                navigation.navigate('Notify');
              }}>
                <View>
                  <MaterialIcons name="notifications" size={30} color="darkviolet" />
                  {unreadCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -4,
                      right: 0,
                      backgroundColor: 'red',
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                    }}>
                      <Text style={{ color: 'white', fontSize: 10 }}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="gray" />
              <TextInput
                placeholder="Search job here..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {suggestions.map((job) => (
                  <TouchableOpacity
                    key={job._id}
                    style={styles.suggestionItem}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeout(() => {
                        setSearchText('');
                        navigation.navigate('Search', {
                          query: job.jobTitle,
                          results: [job],
                        });
                      }, 50);
                    }}
                  >
                    <Text style={styles.suggestionText}>{job.jobTitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            
            <View style={styles.jobStats}>
              <View style={styles.statCardPurple}>
                <Text style={styles.statLabel}>Jobs Applied</Text>
                <Text style={styles.statValue}>{appliedCount}</Text>
              </View>
              <View style={styles.statCardBlue}>
                <Text style={styles.statLabel}>Total Jobs</Text>
                <Text style={styles.statValue}>{totalJobs}</Text>
              </View>
            </View>

            
            <Text style={styles.sectionTitle}>Recommended Jobs</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedJobs.map(renderRecommendedJobCard)}
            </ScrollView>

            
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Jobs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.linkText}>More</Text>
              </TouchableOpacity>
            </View>
            {latestJobs.map(renderRecentJobCard)}

            <TouchableOpacity
              style={styles.moreCardVertical}
              onPress={() =>
                navigation.navigate('Search', {
                  query: '',
                  results: latestJobs,
                })
              }
            >
              <View style={styles.moreCardContent}>
                <Text style={styles.moreText}>More</Text>
                <Ionicons name="arrow-forward-circle" size={24} color="#7c3aed" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}

        
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home" size={24} color="#6b21a8" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="send" size={24} color="#6b21a8" />
            <Text style={styles.navLabel}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
            <Ionicons name="chatbox-outline" size={24} color="#6b21a8" />
            <Text style={styles.navLabel}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#6b21a8" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </NetworkHandler>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { padding: 16, paddingBottom: 80 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  username: { color: '#6b21a8', fontSize: 20, fontWeight: 'bold' },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 4,
  },
  searchInput: { marginLeft: 10, flex: 1 },
  suggestionsBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    marginBottom: 8,
  },
  suggestionItem: { paddingVertical: 6 },
  suggestionText: { color: '#1f2937', fontSize: 14 },
  jobStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statCardPurple: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    width: '48%',
    padding: 16,
  },
  statCardBlue: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    width: '48%',
    padding: 16,
  },
  statLabel: { color: 'white', fontSize: 14 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#1f2937',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  linkText: { color: '#7c3aed' },

  // Recommended Jobs Styles (horizontal cards)
  recommendedJobCardWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    marginRight: 10,
    width: 300,
  },
  recommendedJobCardContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  recommendedJobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recommendedCompanyInfo: {
    color: '#6B7280',
    marginVertical: 4,
  },

  // Recent Jobs Styles (vertical cards)
  recentJobCardWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  recentJobCardContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  recentJobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recentCompanyInfo: {
    color: '#6B7280',
    marginVertical: 4,
  },

  // Common Styles
  logoContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  saveButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 2,
  },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  rowText: { color: '#4B5563', fontSize: 13 },
  description: { color: '#6B7280', fontSize: 13, marginVertical: 4 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 99,
  },
  navLabel: {
    fontSize: 10,
    color: '#6b21a8',
    textAlign: 'center',
    marginTop: 4,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 270,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  moreCardVertical: {
    backgroundColor: '#f3f4f6',
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  moreCardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
errorImage: {
  width: 100,
  height: 100,
  marginBottom: 20,
},
errorText: {
  fontSize: 18,
  color: '#e11d48',
  fontWeight: 'bold',
  marginBottom: 16,
  textAlign: 'center',
},
retryButton: {
  backgroundColor: '#6b21a8',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},
retryText: {
  color: '#fff',
  fontWeight: 'bold',
},

});