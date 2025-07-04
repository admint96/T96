// screens/EditLanguageScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';





export default function EditLanguageScreen({ route, navigation }) {
  const { lang, index, onSave } = route.params;

  const [proficiency, setProficiency] = useState(lang.proficiency || 'Beginner');
  const [canRead, setCanRead] = useState(lang.canRead || false);
  const [canWrite, setCanWrite] = useState(lang.canWrite || false);
  const [canSpeak, setCanSpeak] = useState(lang.canSpeak || false);

  const handleSave = () => {
    const updatedLang = {
      ...lang,
      proficiency,
      canRead,
      canWrite,
      canSpeak,
    };
    onSave(index, updatedLang);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Edit Language {lang.language}</Text>
</View>
     

      <Text style={styles.label}>Proficiency</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={proficiency}
          onValueChange={setProficiency}
          style={{ color: '#000' }}
        >
          <Picker.Item label="Beginner" value="Beginner" />
          <Picker.Item label="Intermediate" value="Intermediate" />
          <Picker.Item label="Fluent" value="Fluent" />
          <Picker.Item label="Native" value="Native" />
        </Picker>
      </View>

      <CheckBox
        title="Can Read"
        checked={canRead}
        onPress={() => setCanRead(!canRead)}
        containerStyle={styles.checkbox}
      />
      <CheckBox
        title="Can Write"
        checked={canWrite}
        onPress={() => setCanWrite(!canWrite)}
        containerStyle={styles.checkbox}
      />
      <CheckBox
        title="Can Speak"
        checked={canSpeak}
        onPress={() => setCanSpeak(!canSpeak)}
        containerStyle={styles.checkbox}
      />

      <Button title="Save Changes" onPress={handleSave} containerStyle={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    marginTop: 8,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        height: 50,
        justifyContent: 'center',
      },
    }),
  },
  checkbox: {
    backgroundColor: '#fff',
    borderWidth: 0,
    paddingVertical: 4,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginLeft: 10,
},

});
