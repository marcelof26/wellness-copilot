import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../src/lib/api';
import { GoalScore, HealthGoal } from '@wellness-copilot/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

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

const GOAL_DESCRIPTIONS: Record<HealthGoal, string> = {
  energy: 'Supports sustained vitality and reduces fatigue throughout the day.',
  sleep_recovery: 'Optimizes rest and overnight cellular repair processes.',
  metabolism: 'Maintains healthy blood sugar, lipids, and body composition.',
  longevity_prevention: 'Reduces long-term risk markers and promotes healthspan.',
  performance: 'Enhances physical output, muscle function, and cognitive focus.',
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <View style={styles.scoreBarContainer}>
      <View style={[styles.scoreBarFill, { width: `${score}%` as any, backgroundColor: color }]} />
    </View>
  );
}

export default function GoalsScreen() {
  const [scores, setScores] = useState<GoalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadScores() {
    const { data } = await api.getGoalScores();
    if (data) setScores(data as GoalScore[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadScores(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadScores(); }} />
      }
    >
      <Text style={styles.heading}>Health Goals</Text>
      <Text style={styles.subheading}>Score based on your biomarkers and daily check-ins</Text>

      {sorted.map((gs) => {
        const color = GOAL_COLORS[gs.goal];
        return (
          <View key={gs.goal} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.goalLabel}>{GOAL_LABELS[gs.goal]}</Text>
              <Text style={[styles.score, { color }]}>{gs.score}</Text>
            </View>

            <ScoreBar score={gs.score} color={color} />

            <Text style={styles.description}>{GOAL_DESCRIPTIONS[gs.goal]}</Text>

            {gs.contributing_biomarkers.length > 0 && (
              <View style={styles.biomarkerRow}>
                {gs.contributing_biomarkers.slice(0, 4).map((b) => (
                  <View key={b} style={styles.biomarkerTag}>
                    <Text style={styles.biomarkerTagText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
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
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
  },
  goalLabel: {
    flex: 1,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  score: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  scoreBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  biomarkerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  biomarkerTag: {
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  biomarkerTagText: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
});
