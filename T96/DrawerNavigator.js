import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './components/pages/HomePage';
import ProfileScreen from './components/pages/UpdateProfileScreen';
import UpdateProfileScreen from './components/pages/UpdateProfileScreen';

const Drawer = createDrawerNavigator();

export default function MyDrawer() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={UpdateProfileScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
