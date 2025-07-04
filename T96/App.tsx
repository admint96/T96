import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/pages/toastConfig';
import NetworkListener from './components/pages/NetworkListener';

// Screens
import NotificationScreen from './components/pages/NotificationScreen';
import UpdateProfileScreen from './components/pages/UpdateProfileScreen';
import HomePage from './components/pages/HomePage';
import JobCard from './components/pages/JobCard';
import Sidebar from './components/pages/Sidebar';
import DrawerNavigator from './DrawerNavigator';
import EditBasicDetailsScreen from './components/Details/EditBasicDetailsScreen';
import EditEducationDetailsScreen from './components/Details/EditEducationDetailsScreen';
import { EditSkillsDetailsScreen } from './components/Details/EditSkillsDetailsScreen';
import { EditEmploymentDetailsScreen } from './components/Details/EditEmploymentDetailsScreen';
import { EditRolesResponsibilitiesScreen } from './components/Details/EditRolesResponsibilitiesScreen';
import EditPersonalDetailsScreen from './components/Details/EditPersonalDetailsScreen';
import { EditProfessionalDetailsScreen } from './components/Details/EditProfessionalDetailsScreen';
import RegistrationScreen from './components/pages/Register';
import LoginScreen from './components/pages/LoginScreen';
import SplashScreen from './components/pages/SplashScreen';
import RoleSelectionScreen from './components/pages/RoleSelectionScreen';
import PostJobs from './components/Recruiter/PostJobs';
import RecruiterHomePage from './components/Recruiter/RecruiterHomePage';
import SideDrawer from './components/Recruiter/SideDrawer';
import AccountSettingsScreen from './components/pages/Sidebar/setting/AccountVerificationScreen';
import OpportunitySearchScreen from './components/pages/Sidebar/Opportunities/OpportunitySearchScreen';
import EditEmailMobileVerify from './components/pages/Sidebar/setting/EditEmailMobileVerify';
import JobResultsScreen from './components/pages/Sidebar/Opportunities/JobSearchScreen';
import RecruiterProfileScreen from './components/Recruiter/RecruiterProfileScreen';
import MyPosts from './components/Recruiter/MyPosts';
import JobApplicants from './components/Recruiter/JobApplicants';
import AppliedJobsScreen from './components/pages/Sidebar/Opportunities/AppliedJobsScreen';
import ResumeViewer from './components/Recruiter/ResumeViewer';
import ApplicantDetails from './components/Recruiter/ApplicantDetails';
import SavedJobs from './components/pages/Sidebar/Opportunities/SavedJobs';
import JobSearch from './components/pages/JobSearch';
import RecommendedJobs from './components/pages/Sidebar/Opportunities/RecommendedJobs';
import ChangePasswordScreen from './components/pages/Sidebar/setting/ChangePasswordScreen';
import ForgotPasswordScreen from './components/pages/Sidebar/setting/ForgotPasswordScreen';
import JobSearchScreen from './components/pages/Sidebar/Opportunities/JobSearchScreen';
import ResultsScreen from './components/pages/Sidebar/Opportunities/ResultsScreen';
import EditLanguageScreen from './components/Details/EditLanguageScreen';
import Search from './components/pages/Search';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <NetworkListener />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* SplashScreen handles redirection logic */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Job Seeker Screens */}
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Profile" component={UpdateProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SavedJobs" component={SavedJobs} />
        <Stack.Screen name="jobcard" component={JobCard} />
        <Stack.Screen name="RoleSelect" component={RoleSelectionScreen} />
        <Stack.Screen name="Sidebar" component={Sidebar} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="Notify" component={NotificationScreen} />
        <Stack.Screen name="Setting" component={AccountSettingsScreen} />
        <Stack.Screen name="OpportunitySearch" component={OpportunitySearchScreen} />
        <Stack.Screen name="RecommendedJobs" component={RecommendedJobs} />
        <Stack.Screen name="appliedjobs" component={AppliedJobsScreen} />
        <Stack.Screen name="JobSearch" component={JobSearchScreen} />
        <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="ApplicantDetails" component={ApplicantDetails} />
        <Stack.Screen name="EditEmailMobileVerify" component={EditEmailMobileVerify} />
        <Stack.Screen name="jobresult" component={JobResultsScreen} />
        <Stack.Screen name="Edit Basic Details" component={EditBasicDetailsScreen} />
        <Stack.Screen name="Edit Professional Details" component={EditProfessionalDetailsScreen} />
        <Stack.Screen name="Edit Employment Details" component={EditEmploymentDetailsScreen} />
        <Stack.Screen name="Edit Roles and responsibilities Details" component={EditRolesResponsibilitiesScreen} />
        <Stack.Screen name="Edit Education Details" component={EditEducationDetailsScreen} />
        <Stack.Screen name="Edit Personal Details" component={EditPersonalDetailsScreen} />
        <Stack.Screen name="EditLanguage" component={EditLanguageScreen} />
        <Stack.Screen name="Edit Skills Details" component={EditSkillsDetailsScreen} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />

        {/* Recruiter Screens */}
        <Stack.Screen name="PostJobs" component={PostJobs} />
        <Stack.Screen name="MyPosts" component={MyPosts} />
        <Stack.Screen name="JobApplicants" component={JobApplicants} />
        <Stack.Screen name="Home-R" component={RecruiterHomePage} />
        <Stack.Screen name="sidebar-R" component={SideDrawer} />
        <Stack.Screen name="RecruiterProfile" component={RecruiterProfileScreen} />
        <Stack.Screen name="ResumeViewer" component={ResumeViewer} />
      </Stack.Navigator>

      <Toast config={toastConfig} position="top" topOffset={50} />
    </NavigationContainer>
  );
};

export default App;
