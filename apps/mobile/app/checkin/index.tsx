import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

interface ScaleProps {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}

function Scale({ label, value, onChange }: ScaleProps) {
  return (
    <View style={styles.scaleContainer}>
      <Text style={styles.scaleLabel}>{label}</Text>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.scaleButton,
              value === n && styles.scaleButtonActive,
            ]}
            onPress={() => onChange(n)}
          >
            <Text
              style={[
                styles.scaleButtonText,
                value === n && styles.scaleButtonTextActive,
              ]}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.scaleHints}>
        <Text style={styles.scaleHint}>Low</Text>
        <Text style={styles.scaleHint}>High</Text>
      </View>
    </View>
  );
}

export default function CheckInScreen() {
  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!energy || !sleep || !stress || !mood) {
      Alert.alert('Almost there', 'Please rate all four areas to continue.');
      return;
    }

    setLoading(true);
    const { error } = await api.createCheckin({
      energy_level: energy,
      sleep_quality: sleep,
      stress_level: stress,
      mood,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Check-in saved!', 'Your data has been recorded.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Daily Check-in</Text>
        <Text style={styles.subtitle}>Rate how you're feeling right now</Text>

        <Scale label="Energy Level" value={energy} onChange={setEnergy} />
        <Scale label="Sleep Quality (last night)" value={sleep} onChange={setSleep} />
        <Scale label="Stress Level" value={stress} onChange={setStress} />
        <Scale label="Mood" value={mood} onChange={setMood} />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Save Check-in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.separator,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  scaleContainer: {
    marginBottom: Spacing.xl,
  },
  scaleLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scaleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scaleButtonText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  scaleButtonTextActive: {
    color: Colors.white,
    fontWeight: Typography.weight.bold,
  },
  scaleHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  scaleHint: {
    fontSize: Typography.size.xs,
    color: Colors.textDisabled,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
  },
});
