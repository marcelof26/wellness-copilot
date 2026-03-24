import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAppStore } from '../../src/store';
import { api } from '../../src/lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { HealthGoal } from '@wellness-copilot/types';

const GOAL_LABELS: Record<HealthGoal, string> = {
  energy: 'Daily Energy',
  sleep_recovery: 'Sleep & Recovery',
  metabolism: 'Metabolic Health',
  longevity_prevention: 'Longevity',
  performance: 'Performance',
};

export default function ProfileScreen() {
  const { profile, setProfile, clearAuth } = useAppStore();
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    if (!profile) {
      api.getProfile().then(({ data }) => {
        if (data) setProfile(data as any);
        setLoading(false);
      });
    }
  }, []);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Your Name'}</Text>
        <Text style={styles.email}>{profile?.email || ''}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Health Focus</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Goal</Text>
          <Text style={styles.infoValue}>
            {profile?.primary_goal
              ? GOAL_LABELS[profile.primary_goal as HealthGoal]
              : 'Not set'}
          </Text>
        </View>
        {profile?.date_of_birth && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.date_of_birth).toLocaleDateString()}
            </Text>
          </View>
        )}
        {profile?.sex && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biological Sex</Text>
            <Text style={[styles.infoValue, styles.infoValueCapitalized]}>
              {profile.sex}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingTop: Spacing.xxxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
  },
  name: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  infoValueCapitalized: {
    textTransform: 'capitalize',
  },
  signOutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  signOutText: {
    color: Colors.error,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
