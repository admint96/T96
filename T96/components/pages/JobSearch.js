import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {API_URL} from '../../config';

export default function JobSearch({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('');
  const [salary, setSalary] = useState('');
  const [company, setCompany] = useState('');
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const saveJob = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  const TimeStamp = ({ date }) => {
    const timeAgo = (d) => {
      const diff = Math.floor((Date.now() - new Date(d)) / (1000 * 60 * 60 * 24));
      return diff === 0 ? 'Today' : `${diff} day${diff > 1 ? 's' : ''} ago`;
    };
    return <Text style={{ color: '#6B7280', fontSize: 12 }}>{timeAgo(date)}</Text>;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recruiters/jobs`);
        const data = await res.json();
        setAllJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err.message);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyFilters = () => {
    const filtered = allJobs.filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = location === '' || job.location === location;
      const matchesExperience = experience === '' || job.experience === experience;
      const matchesJobType = jobType === '' || job.jobType === jobType;
      const matchesSalary = salary === '' || job.salary.includes(salary);
      const matchesCompany = company === '' || job.companyName === company;
      return (
        matchesSearch &&
        matchesLocation &&
        matchesExperience &&
        matchesJobType &&
        matchesSalary &&
        matchesCompany
      );
    });
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    handleApplyFilters();
  }, [searchQuery, location, experience, jobType, salary, company, allJobs]);

  const clearFilters = () => {
    setLocation('');
    setExperience('');
    setJobType('');
    setSalary('');
    setCompany('');
  };

  const uniqueCompanies = [...new Set(allJobs.map((job) => job.companyName))];

  return (
    <View style={styles.container}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search-outline" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search job title or company"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterHeader}>
        <Ionicons name="filter" size={18} color="#555" />
        <Text style={styles.filterHeaderText}>Filters</Text>
        <Ionicons
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#555"
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View>
            {showFilters && (
              <View style={styles.filterSection}>
                <View style={styles.filterBox}>
                  <Text style={styles.filterLabel}>Location</Text>
                  <Picker selectedValue={location} onValueChange={setLocation} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    {[...new Set(allJobs.map((job) => job.location))].map((loc) => (
                      <Picker.Item key={loc} label={loc} value={loc} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterLabel}>Experience</Text>
                  <Picker selectedValue={experience} onValueChange={setExperience} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    {[...new Set(allJobs.map((job) => job.experience))].map((exp) => (
                      <Picker.Item key={exp} label={exp} value={exp} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterLabel}>Job Type</Text>
                  <Picker selectedValue={jobType} onValueChange={setJobType} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    {[...new Set(allJobs.map((job) => job.jobType))].map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterLabel}>Salary</Text>
                  <Picker selectedValue={salary} onValueChange={setSalary} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    {[...new Set(allJobs.map((job) => job.salary))].map((sal) => (
                      <Picker.Item key={sal} label={sal} value={sal} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterLabel}>Company</Text>
                  <Picker selectedValue={company} onValueChange={setCompany} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    {uniqueCompanies.map((comp) => (
                      <Picker.Item key={comp} label={comp} value={comp} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.jobsHeading}>Jobs</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
            style={styles.jobCardContainer}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.jobTitle}>{item.jobTitle}</Text>
              <Text style={styles.companyInfo}>{item.companyName}</Text>
              <View style={styles.rowInfo}>
                <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
                <Text style={styles.rowText}> {item.experience || '1-3 Yrs'}</Text>
                <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
                <Text style={styles.rowText}>{item.location}</Text>
              </View>
              <Text style={styles.description}>{item.description?.slice(0, 70)}...</Text>
              <View style={styles.skillsContainer}>
                {(item.skills || []).map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.footer}>
                <TimeStamp date={item.postedAt} />
                <TouchableOpacity onPress={() => saveJob(item._id)}>
                  <Ionicons
                    name={savedJobIds.includes(item._id) ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={savedJobIds.includes(item._id) ? '#6495ED' : 'gray'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Image
              source={{ uri: item.companyLogo || 'https://placehold.co/48x48' }}
              style={styles.logoImage}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>No jobs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 10, paddingHorizontal: 10, marginBottom: 12, backgroundColor: '#fff',
  },
  searchIcon: { marginRight: 8 },
  searchBar: { flex: 1, paddingVertical: 8, color: 'black' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  filterHeaderText: { marginLeft: 6, fontWeight: 'bold', fontSize: 16, color: '#000' },
  filterSection: {
    marginBottom: 16, backgroundColor: '#fff', padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0',
  },
  filterBox: { marginBottom: 12 },
  filterLabel: { fontSize: 14, color: '#000', marginBottom: 4 },
  picker: { backgroundColor: '#fff', color: 'black' },
  clearButton: {
    marginTop: 10, paddingVertical: 10, backgroundColor: '#e11d48',
    borderRadius: 8, alignItems: 'center',
  },
  clearButtonText: { color: '#fff', fontWeight: 'bold' },
  jobsHeading: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 10, marginBottom: 10 },
  jobCardContainer: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9f9f9',
    padding: 15, borderRadius: 10, marginVertical: 6, alignItems: 'center',
  },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  companyInfo: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  rowText: { color: '#000', fontSize: 13 },
  description: { color: '#444', fontSize: 13, marginVertical: 4 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
  skillTag: {
    backgroundColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 8,
    paddingVertical: 4, marginRight: 6, marginBottom: 6,
  },
  skillText: { fontSize: 12, color: '#000' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 48, height: 48, borderRadius: 10, marginLeft: 12, backgroundColor: '#ccc',
  },
});