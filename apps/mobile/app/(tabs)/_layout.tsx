import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="copilot"
        options={{
          title: 'Copilot',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>✦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>◎</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="biomarkers"
        options={{
          title: 'Labs',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>⚡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>⏱</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
