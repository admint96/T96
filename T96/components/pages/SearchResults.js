import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TimeStamp from './TimeStamp'; 

export default function SearchResults({ route, navigation }) {
  const { query, results = [] } = route.params;

  const renderJobCard = ({ item: job }) => {
    const displayedSkills = (job.Skills || job.skills || []).slice(0, 2);
    const hasMoreSkills = (job.Skills || job.skills || []).length > 2;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('jobcard', { job })}
      >
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{job.jobTitle}</Text>
          <Text style={styles.company}>{job.companyName}</Text>

          <View style={styles.row}>
            <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
            <Text style={styles.rowText}>{job.experience || '1-3 Yrs'}</Text>
            <Ionicons
              name="location-outline"
              size={16}
              color="#6B7280"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.rowText}>{job.location}</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {job.description}
          </Text>

          <View style={styles.skills}>
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

          <View style={styles.bottom}>
            <TimeStamp date={job.postedAt} />
          </View>
        </View>

        <Image
          source={{ uri: job.companyLogo || 'https://placehold.co/48x48' }}
          style={styles.logo}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Results for "{query}"</Text>
      {results.length === 0 ? (
        <Text style={styles.noResults}>No jobs found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  noResults: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    color: '#6B7280',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowText: {
    color: '#4B5563',
    fontSize: 13,
    marginLeft: 4,
  },
  description: {
    color: '#6B7280',
    fontSize: 13,
    marginVertical: 4,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
  },
  bottom: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 48,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
