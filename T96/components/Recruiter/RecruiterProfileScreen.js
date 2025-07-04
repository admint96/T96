import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import { useNavigation } from '@react-navigation/native';

const RecruiterProfileScreen = () => {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    profileImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/recruiters/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to fetch');

      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        companyName: data.companyName || '',
        companyWebsite: data.companyWebsite || '',
        profileImage: data.profileImage || '',
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${API_URL}/api/uploads/upload-profile-R`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setProfile((prev) => ({
        ...prev,
        profileImage: data.imageUrl,
      }));

      Alert.alert('Success', 'Profile image uploaded');
    } catch (err) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      if (res.didCancel || res.errorCode) return;
      if (res.assets?.[0]?.uri) {
        uploadImage(res.assets[0].uri);
      }
    });
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');

      const { email, ...payload } = profile;

      const response = await fetch(`${API_URL}/api/recruiters/update-data`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to update');

      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('Home-R');
    } catch (err) {
      Alert.alert('Update Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  ) : (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{ fontSize: 35 }}>←</Text>
          </TouchableOpacity>

          <Image
            source={{
              uri: profile.profileImage || 'https://via.placeholder.com/100',
            }}
            style={styles.image}
          />

          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            {uploading ? <ActivityIndicator /> : <Text>Upload Profile Image</Text>}
          </TouchableOpacity>

          {[
            { label: 'Full Name', key: 'fullName' },
            { label: 'Email', key: 'email', readOnly: true },
            { label: 'Company Name', key: 'companyName' },
            { label: 'Company Website', key: 'companyWebsite' },
          ].map((item) => (
            <View style={styles.field} key={item.key}>
              <Text style={styles.label}>{item.label}</Text>
              <TextInput
                style={[
                  styles.input,
                  item.readOnly && { backgroundColor: '#f0f0f0', color: '#888' },
                ]}
                value={profile[item.key]}
                editable={!item.readOnly}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, [item.key]: text }))
                }
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.button}
            onPress={updateProfile}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: { position: 'absolute', top: 10, left: 15 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 60,
    alignSelf: 'center',
  },
  imageButton: { marginTop: 10, alignSelf: 'center' },
  field: { marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default RecruiterProfileScreen;
