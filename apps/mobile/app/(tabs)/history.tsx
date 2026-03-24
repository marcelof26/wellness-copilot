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
import { TimelineEvent } from '@wellness-copilot/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

const EVENT_ICONS: Record<string, string> = {
  lab_upload: '🧪',
  check_in: '✅',
  goal_change: '🎯',
  recommendation_generated: '💡',
  weekly_review: '📊',
};

export default function HistoryScreen() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadEvents() {
    const { data } = await api.getTimeline(50);
    if (data) setEvents(data as TimelineEvent[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadEvents(); }, []);

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
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }} />
      }
    >
      <Text style={styles.heading}>Timeline</Text>
      <Text style={styles.subheading}>Your health activity history</Text>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No activity recorded yet.</Text>
        </View>
      ) : (
        events.map((event, index) => (
          <View key={event.id} style={styles.eventRow}>
            {/* Timeline line */}
            <View style={styles.timelineCol}>
              <View style={styles.eventDot} />
              {index < events.length - 1 && <View style={styles.eventLine} />}
            </View>

            <View style={styles.eventContent}>
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventIcon}>
                    {EVENT_ICONS[event.event_type] || '📌'}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                {event.summary && (
                  <Text style={styles.eventSummary}>{event.summary}</Text>
                )}
              </View>
            </View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  timelineCol: {
    width: 24,
    alignItems: 'center',
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginTop: 14,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  eventMeta: { flex: 1 },
  eventTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  eventDate: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  eventSummary: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 19,
  },
});
