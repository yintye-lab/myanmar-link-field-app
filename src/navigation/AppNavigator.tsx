import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import JobListScreen from '../screens/JobListScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ONUBindScreen from '../screens/ONUBindScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons: any = { Dashboard: 'home', Jobs: 'list', Map: 'map', Profile: 'person' };
        return <Ionicons name={focused ? icons[route.name] : `${icons[route.name]}-outline`} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0052CC',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E0E0E0', height: 60, paddingBottom: 8 },
      headerStyle: { backgroundColor: '#0052CC' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
    })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Jobs" component={JobListScreen} options={{ title: 'My Jobs' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useSelector((state: RootState) => state.app.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{
              headerShown: true, headerStyle: { backgroundColor: '#0052CC' }, headerTintColor: '#FFF', title: 'Job Details'
            }} />
            <Stack.Screen name="ONUBind" component={ONUBindScreen} options={{
              headerShown: true, headerStyle: { backgroundColor: '#0052CC' }, headerTintColor: '#FFF', title: 'ONU Bind Form'
            }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
