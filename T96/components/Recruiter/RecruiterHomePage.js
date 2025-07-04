import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SideDrawer from '../Recruiter/SideDrawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

const RecruiterHomePage = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [openJobsCount, setOpenJobsCount] = useState(0);
  const [shortListedCount, setShortListedCount] = useState(0);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-300)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/recruiters/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      let totalOpenings = 0;
      let totalShortlisted = 0;

      if (res.ok) {
        const jobs = data?.jobs || [];

        jobs.forEach((job) => {
          totalOpenings += job.openings || 0;
          const applicants = job.applicants || [];
          applicants.forEach((a) => {
            if (a.applicationStatus === 'shortlist') totalShortlisted += 1;
          });
        });

        setOpenJobsCount(totalOpenings);
        setShortListedCount(totalShortlisted);
      }

      const seekersRes = await fetch(`${API_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seekersData = await seekersRes.json();
      const updatedSeekers = (seekersData || []).map((seeker) => ({
        ...seeker,
        userId: seeker.userId,
      }));
      setJobSeekers(updatedSeekers);
    } catch (err) {
      console.error('Error loading recruiter home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDrawer = () => (isDrawerOpen ? closeDrawer() : openDrawer());
  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false));
  };
  const handleSearchPress = () => {
    if (isDrawerOpen) closeDrawer();
    else searchInputRef.current?.focus();
  };

  const normalize = (str) => (str || '').toLowerCase().trim();
  const filteredCandidates = jobSeekers.filter((js) => {
    const name = normalize(js.fullName);
    const designation = normalize(js.professionalDetails?.designation);
    const query = normalize(searchQuery);
    return name.includes(query) || designation.includes(query);
  });

  const stats = [
    { id: '1', title: 'Open Positions', value: openJobsCount.toString(), color: '#7c3aed' },
    { id: '2', title: 'Short Listed', value: shortListedCount.toString(), color: '#7c3aed' },
  ];

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={() =>
        navigation.navigate('ApplicantDetails', {
          applicantId: item.userId,
        })
      }
    >
      <Image
        source={{
          uri: item.profileImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        }}
        style={styles.cardImageVertical}
        resizeMode="cover"
      />
      <View style={styles.verticalCardInfo}>
        <Text style={styles.cardName}>{item.fullName || 'Unnamed'}</Text>
        <Text style={styles.cardDesignation} numberOfLines={1}>
          {item.professionalDetails?.designation?.trim() || 'No designation'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={styles.container}>
      {isDrawerOpen && (
        <SideDrawer animation={drawerAnimation} closeDrawer={closeDrawer} style={styles.drawer} />
      )}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <View style={styles.mainContent}>
         
          <View style={styles.topNav}>
            <View style={styles.navSide}>
              <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                <MaterialIcons name="menu" size={28} color="#7c3aed" />
              </TouchableOpacity>
            </View>
            <View style={styles.navCenter}>
              <Text style={styles.header}>Dashboard</Text>
            </View>
            <View style={styles.navSide}>
              <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
                <MaterialIcons name="" size={24} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <View style={styles.content}>
              <View style={styles.statsContainer}>
                {stats.map((stat) => (
                  <View key={stat.id} style={[styles.statCard, { backgroundColor: stat.color }]}>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>

              <TouchableWithoutFeedback onPress={handleSearchPress}>
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={22} color="#999" />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchBar}
                    placeholder="Search candidates..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </TouchableWithoutFeedback>

              <Text style={styles.sectionHeader}>Candidates ({filteredCandidates.length})</Text>
              <FlatList
                data={filteredCandidates}
                keyExtractor={(item, index) => item.userId || index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            </View>
          </KeyboardAvoidingView>

          {!isKeyboardVisible && (
            <View style={styles.bottomNav}>
              <TouchableOpacity style={styles.navItem}>
                <MaterialIcons name="home" size={24} color="#7c3aed" />
                <Text style={[styles.navText, { color: '#7c3aed' }]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyPosts')}>
                <MaterialIcons name="event-note" size={24} color="#666" />
                <Text style={styles.navText}>My Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PostJobs')}>
                <MaterialIcons name="add" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <MaterialIcons name="message" size={24} color="#666" />
                <Text style={styles.navText}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('RecruiterProfile')}
              >
                <MaterialIcons name="person" size={24} color="#666" />
                <Text style={styles.navText}>Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  mainContent: { flex: 1 },
  drawer: { position: 'absolute', zIndex: 100, width: 300, height: '100%' },
  content: { flex: 1, padding: 16, paddingBottom: 0 },

  // ✅ Centered top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  navSide: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  menuButton: { padding: 8, borderRadius: 20 },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  statTitle: { fontSize: 14, color: '#FFF', marginBottom: 5, fontWeight: '500' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    elevation: 3,
  },
  searchBar: { flex: 1, height: 48, fontSize: 16, color: '#333', marginLeft: 8 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  verticalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cardImageVertical: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  verticalCardInfo: { flex: 1, flexShrink: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardDesignation: { fontSize: 14, color: '#777', marginTop: 2 },
  bottomNav: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', paddingHorizontal: 10 },
  navText: { fontSize: 12, color: '#666', marginTop: 4 },
  addButton: {
    backgroundColor: '#5A1EFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
});

export default RecruiterHomePage;
