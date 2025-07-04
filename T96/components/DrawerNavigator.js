// DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomePage from './pages/HomePage';
import Sidebar from './pages/Sidebar'; 
import LoginScreen from './pages/LoginScreen'; 



const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="MockInterviews" component={LoginScreen} />
      <Drawer.Screen name="Tutorials" component={LoginScreen} />

    </Drawer.Navigator>
  );
}
