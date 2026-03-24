import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store';
import { api } from '../../src/lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { HealthGoal, Recommendation, PriorityState } from '@wellness-copilot/types';

const GOAL_LABELS: Record<HealthGoal, string> = {
  energy: 'Daily Energy',
  sleep_recovery: 'Sleep & Recovery',
  metabolism: 'Metabolic Health',
  longevity_prevention: 'Longevity',
  performance: 'Performance',
};

const GOAL_COLORS: Record<HealthGoal, string> = {
  energy: Colors.energy,
  sleep_recovery: Colors.sleep_recovery,
  metabolism: Colors.metabolism,
  longevity_prevention: Colors.longevity_prevention,
  performance: Colors.performance,
};

export default function CopilotScreen() {
  const { profile, setPriority, setRecommendations } = useAppStore();
  const [priority, setPriorityState] = useState<PriorityState | null>(null);
  const [recommendations, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [priorityRes, recsRes] = await Promise.all([
      api.getPriority(),
      api.getRecommendations(),
    ]);

    if (priorityRes.data) {
      setPriorityState(priorityRes.data as PriorityState);
      setPriority(priorityRes.data as PriorityState);
    }
    if (recsRes.data) {
      const recs = recsRes.data as Recommendation[];
      setRecs(recs);
      setRecommendations(recs);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const primaryGoal = priority?.primary_goal;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </Text>
        <Text style={styles.subheading}>Your wellness focus today</Text>
      </View>

      {/* Primary Focus Card */}
      {primaryGoal && (
        <View style={[styles.focusCard, { borderLeftColor: GOAL_COLORS[primaryGoal] }]}>
          <Text style={styles.focusLabel}>Primary Focus</Text>
          <Text style={[styles.focusGoal, { color: GOAL_COLORS[primaryGoal] }]}>
            {GOAL_LABELS[primaryGoal]}
          </Text>
          {priority?.focus_lock_until && (
            <Text style={styles.lockText}>
              Focus locked until {new Date(priority.focus_lock_until).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Check-in CTA */}
      <TouchableOpacity
        style={styles.checkinButton}
        onPress={() => router.push('/checkin')}
      >
        <Text style={styles.checkinButtonText}>Daily Check-in</Text>
        <Text style={styles.checkinButtonSub}>Takes less than 60 seconds</Text>
      </TouchableOpacity>

      {/* Recommendations */}
      <Text style={styles.sectionTitle}>Your Recommendations</Text>
      {recommendations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Upload your lab results to get personalized recommendations.
          </Text>
        </View>
      ) : (
        recommendations.slice(0, 3).map((rec) => (
          <View key={rec.id} style={styles.recCard}>
            <View
              style={[
                styles.recBadge,
                { backgroundColor: GOAL_COLORS[rec.goal] + '20' },
              ]}
            >
              <Text style={[styles.recBadgeText, { color: GOAL_COLORS[rec.goal] }]}>
                {GOAL_LABELS[rec.goal]}
              </Text>
            </View>
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recBody}>{rec.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingTop: Spacing.xxxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: Spacing.xl },
  greeting: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  focusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderLeftWidth: 4,
    marginBottom: Spacing.base,
    ...Shadows.md,
  },
  focusLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  focusGoal: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  lockText: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  checkinButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  checkinButtonText: {
    color: Colors.white,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  checkinButtonSub: {
    color: Colors.primaryLight,
    fontSize: Typography.size.xs,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  recCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  recBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  recBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  recTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  recBody: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
