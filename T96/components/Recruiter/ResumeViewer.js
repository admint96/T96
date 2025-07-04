import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

const ResumeViewer = ({ route }) => {
  const { resumeUrl } = route.params;

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: resumeUrl, cache: true }}
        style={styles.pdf}
        onError={(error) => {
          console.error('PDF error:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default ResumeViewer;
