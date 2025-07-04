import React, { useEffect, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import {API_URL} from '../../config';

export default function Search({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('');
  const [salary, setSalary] = useState('');
  const [company, setCompany] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    if (experience) params.append('experience', experience);
    if (jobType) params.append('jobType', jobType);
    if (salary) params.append('salary', salary);
    if (company) params.append('company', company);
    return params.toString();
  };

  const fetchJobs = async () => {
    try {
      const query = buildQuery();
      const res = await fetch(`${API_URL}/api/recruiters/jobs?${query}`);
      const data = await res.json();
      setFilteredJobs(data);
      const companies = [...new Set(data.map((job) => job.companyName || 'Company not provided'))];
      setUniqueCompanies(companies);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  useEffect(() => {
    if (route?.params?.query) setSearchQuery(route.params.query);
    if (route?.params?.results) setFilteredJobs(route.params.results);
    else fetchJobs();
  }, [route]);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, location, experience, jobType, salary, company]);

  const clearFilters = () => {
    setLocation('');
    setExperience('');
    setJobType('');
    setSalary('');
    setCompany('');
  };

  const renderItem = ({ item: job }) => {
    const displayedSkills = job.skills?.slice(0, 3) || [];
    const hasMoreSkills = job.skills?.length > 3;

    return (
      <TouchableOpacity
        key={job._id}
        onPress={() => navigation.navigate('jobcard', { job })}
        style={styles.jobCardWrapper}
      >
        <View style={styles.jobCardContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.jobTitle}</Text>
            <Text style={styles.companyInfo} numberOfLines={1}>{job.companyName}</Text>

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

            <View style={styles.footer}>
              <Text style={styles.timestamp}>
                {new Date(job.postedAt).toLocaleDateString()}
              </Text>
              <Ionicons name="bookmark-outline" size={20} color="gray" />
            </View>
          </View>

          <Image
            source={{ uri: job.companyLogo || 'https://placehold.co/48x48' }}
            style={styles.logoImage}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
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

      {/* Toggle Filters */}
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
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            {showFilters && (
              <View style={styles.filterSection}>
                {/* Filter Fields */}
                {[['Location', location, setLocation, ['All', 'Bangalore', 'Delhi', 'Remote']],
                  ['Experience', experience, setExperience, ['All', '0-1', '1-3']],
                  ['Job Type', jobType, setJobType, ['All', 'Full-time', 'Remote', 'Internship']],
                  ['Salary', salary, setSalary, ['All', '₹6-10 LPA', '₹8-12 LPA', '₹15,000/month']],
                  ['Company', company, setCompany, ['All', ...uniqueCompanies]]].map(([label, value, setter, options]) => (
                  <View key={label} style={styles.filterBox}>
                    <Text style={styles.filterLabel}>{label}</Text>
                    <Picker selectedValue={value} onValueChange={setter} style={styles.picker}>
                      {options.map((opt, i) => (
                        <Picker.Item key={i} label={opt} value={opt === 'All' ? '' : opt} />
                      ))}
                    </Picker>
                  </View>
                ))}
                <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.jobsHeading}>Jobs</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>No jobs found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 10, paddingHorizontal: 10,
    marginBottom: 12, backgroundColor: '#fff',
  },
  searchIcon: { marginRight: 8 },
  searchBar: { flex: 1, paddingVertical: 8, color: 'black' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  filterHeaderText: { marginLeft: 6, fontWeight: 'bold', fontSize: 16, color: '#000' },
  filterSection: {
    marginBottom: 16, backgroundColor: '#fff',
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0',
  },
  filterBox: { marginBottom: 12 },
  filterLabel: { fontSize: 14, color: '#000', marginBottom: 4 },
  picker: {
    borderWidth: 1, borderColor: '#ccc',
    backgroundColor: '#fff', borderRadius: 8, color: 'black',
  },
  clearButton: {
    marginTop: 10, paddingVertical: 10,
    backgroundColor: '#e11d48', borderRadius: 8, alignItems: 'center',
  },
  clearButtonText: { color: '#fff', fontWeight: 'bold' },
  jobsHeading: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 10, marginBottom: 10 },
  
  jobCardWrapper: {
    marginVertical: 6,
  },
  jobCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  companyInfo: { fontSize: 14, color: '#333' },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rowText: { fontSize: 13, color: '#444' },
  description: { fontSize: 13, color: '#555', marginTop: 6 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  skillTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: { color: '#1e40af', fontSize: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timestamp: { fontSize: 12, color: 'gray' },
  logoImage: { width: 48, height: 48, borderRadius: 8, marginLeft: 10 },
});
