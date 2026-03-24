import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../src/lib/supabase';
import { useAppStore } from '../src/store';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const { setAuth, clearAuth } = useAppStore();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    // Restore session on app start before rendering any screen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session.user.id, session.access_token);
        SecureStore.setItemAsync('access_token', session.access_token);
      }
      setSessionLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setAuth(session.user.id, session.access_token);
          await SecureStore.setItemAsync('access_token', session.access_token);
        } else {
          clearAuth();
          await SecureStore.deleteItemAsync('access_token');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Block rendering until we know if there's a session
  if (!sessionLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
