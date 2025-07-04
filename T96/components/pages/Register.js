import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../../config';

export default function RegistrationScreen({ navigation, route }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isExperienced, setIsExperienced] = useState(true);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const role = route.params?.role;
  
    console.log('API_URL:', API_URL);
    const handleRegister = async () => {
        if (!fullName || !email || !password || !mobileNumber) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    mobileNumber,
                    workStatus: isExperienced ? 'experienced' : 'fresher',
                    updatesViaEmail: checked,
                    role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Registration successful', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login', { role }),
                    },
                ]);
            } else {
                Alert.alert('Registration Failed', data.message || 'Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <View style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="#000" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Talent96</Text>
                </View>

                <View style={styles.separatorLine} />

                <Text style={styles.heading}>Create your profile</Text>
                <Text style={styles.subheading}>Please fill the registration form below</Text>

                <Text style={styles.label}>Full name</Text>
                <TextInput
                    placeholder="Enter your name"
                    placeholderTextColor="#888"
                    value={fullName}
                    onChangeText={setFullName}
                    style={styles.input}
                    autoCapitalize="words"
                />

                <Text style={styles.label}>Email ID</Text>
                <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    placeholder="(Minimum 6 Characters)"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />

                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                    placeholder="+91 Enter your mobile number"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    style={styles.input}
                />

                <Text style={styles.label}>Work Status</Text>
                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        style={[styles.statusButton, isExperienced && styles.selectedStatus]}
                        onPress={() => setIsExperienced(true)}
                    >
                        <Text>I'm experienced</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusButton, !isExperienced && styles.selectedStatus]}
                        onPress={() => setIsExperienced(false)}
                    >
                        <Text style={{ textAlign: 'center' }}>
                            I'm fresher{'\n'}(Eager to Contribute)
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Checkbox */}
                <TouchableOpacity
                    onPress={() => setChecked(!checked)}
                    style={styles.checkboxContainer}
                    activeOpacity={0.8}
                >
                    <View style={styles.checkbox}>
                        {checked && <Icon name="checkmark" size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxText}>Send important updates via email</Text>
                </TouchableOpacity>

                <Text style={styles.terms}>
                    By clicking Register, you agree to the Terms and Conditions & Privacy Policy of Talent96
                </Text>

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register Now</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    separatorLine: {
        height: 1,
        backgroundColor: '#f5f5f5',
        marginBottom: 20,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subheading: {
        marginBottom: 10,
        color: '#666',
    },
    label: {
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        textTransform: 'capitalize',
    },
    input: {
        backgroundColor: '#fff',
        color: '#000',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    statusButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center',
    },
    selectedStatus: {
        borderColor: '#6200ee',
        backgroundColor: '#e6ddff',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#6200ee',
    },
    checkboxText: {
        fontSize: 14,
        color: '#333',
    },
    terms: {
        fontSize: 12,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#6200ee',
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
