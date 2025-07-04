import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setRefreshing(true);
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      if (!userId || !token) {
        console.warn('User ID or token not found in AsyncStorage');
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotifications(); // Refresh
      } else {
        const errorData = await response.json();
        console.error('Failed to mark as read:', errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/notifications/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        const err = await response.json();
        console.error('Failed to mark all as read:', err.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => {
    const companyName = item?.metadata?.companyName;
    const companyLogo = item?.metadata?.companyLogo;

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => markAsRead(item._id)}
      >
        <View style={styles.row}>
          <View style={styles.iconWrapper}>
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.logo} />
            ) : (
              <Icon name="notifications-outline" size={22} color="#2563FF" />
            )}
          </View>

          <View style={styles.textContent}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]}>
              {companyName || 'Notification'}
            </Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={35} color="black" />
        </TouchableOpacity>

        <Text style={styles.header}>Notifications</Text>

        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAll}>Mark All as Read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !refreshing ? (
            <Text style={styles.noData}>No notifications</Text>
          ) : null
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginLeft: -26,
  },
  markAll: {
    fontSize: 13,
    color: '#2563FF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  unreadCard: {
    backgroundColor: '#EEF2FF',
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
    overflow: 'hidden',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadText: {
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
    marginTop: 50,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default NotificationScreen;
