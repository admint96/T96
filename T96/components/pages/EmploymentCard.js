import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EmploymentCard = ({ employmentList, setEmploymentList, navigation, userId, token }) => {
  return (
    <View style={styles.card}>
      <View style={styles.educationHeader}>
        <Text style={styles.sectionTitle}>Employment</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Edit Employment Details', {
              mode: 'add',
              employment: {
                company: '',
                jobTitle: '',
                currentSalaryFixed: '',
                currentSalaryVariable: '',
                isCurrentCompany: false,
                startDate: '',
                endDate: '',
                isOngoing: false,
                payType: '',
              },
              userId,
              token,
              onSave: (newEntry) => setEmploymentList((prev) => [...prev, newEntry]),
            })
          }
        >
          <Ionicons name="add-circle-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {employmentList.length === 0 ? (
        <Text style={styles.previewText}>No employment details added yet.</Text>
      ) : (
        employmentList.map((job, index) => (
          <View key={job._id || index} style={styles.educationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eduhead}>{job.company}</Text>
              <Text style={styles.previewText}>Role: {job.jobTitle}</Text>
              <Text style={styles.previewText}>Pay Type: {job.payType}</Text>
              {job.currentSalaryFixed && job.currentSalaryFixed !== '0' && (
                <Text style={styles.previewText}>Fixed: {job.currentSalaryFixed}</Text>
              )}
              {job.currentSalaryVariable && job.currentSalaryVariable !== '0' && (
                <Text style={styles.previewText}>Variable: {job.currentSalaryVariable}</Text>
              )}
              <Text style={styles.previewText}>
                Duration: {job.startDate} - {job.isOngoing ? 'Ongoing' : job.endDate}
              </Text>
              <Text style={styles.previewText}>
                Currently Employed: {job.isCurrentCompany ? 'Yes' : 'No'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editIcon}
              onPress={() =>
                navigation.navigate('Edit Employment Details', {
                  mode: 'edit',
                  employment: job,
                  index,
                  userId,
                  token,
                  onUpdate: (updatedEntry) => {
                    const updatedList = [...employmentList];
                    updatedList[index] = updatedEntry;
                    setEmploymentList(updatedList);
                  },
                })
              }
            >
              <Ionicons name="pencil" size={20} color="#007bff" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  previewText: {
    fontSize: 14,
    marginTop: 4,
    color: '#444',
  },
  educationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  eduhead: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  editIcon: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
});

export default EmploymentCard;
