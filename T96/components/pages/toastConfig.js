import React from 'react';
import { BaseToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentSmall}
      text1Style={styles.text1Small}
      text2Style={styles.text2Small}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    height: 80,
    borderLeftColor: 'blue',
  },
  infoToast: {
    height: 80,
    borderLeftColor: 'red',
  },
  content: {
    paddingHorizontal: 15,
  },
  contentSmall: {
    paddingHorizontal: 10,
  },
  text1: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text2: {
    fontSize: 16,
  },
  text1Small: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  text2Small: {
    fontSize: 13,
  },
});
