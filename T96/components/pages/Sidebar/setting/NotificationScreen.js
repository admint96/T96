import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setRefreshing(true);
      const userId = await AsyncStorage.getItem('userId'); 
      const response = await axios.get(`http://192.168.30.231:5000/api/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <Icon name={item.icon || 'notifications-outline'} size={24} color="#2563FF" />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.title, !item.isRead && styles.unread]}>
            {item.title}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.noData}>No notifications</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  unread: {
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 13,
    color: '#4B5563',
    marginVertical: 2,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default NotificationScreen;