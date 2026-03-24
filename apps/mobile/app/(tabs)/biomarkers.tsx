import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../../src/lib/api';
import { BiomarkerResult, Document } from '@wellness-copilot/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

const STATUS_COLORS: Record<string, string> = {
  optimal: Colors.optimal,
  normal: Colors.normal,
  borderline: Colors.borderline,
  abnormal: Colors.abnormal,
  unknown: Colors.unknown,
};

const STATUS_LABELS: Record<string, string> = {
  optimal: 'Optimal',
  normal: 'Normal',
  borderline: 'Borderline',
  abnormal: 'Review',
  unknown: 'N/A',
};

export default function BiomarkersScreen() {
  const [results, setResults] = useState<BiomarkerResult[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadData = useCallback(async () => {
    const [resultsRes, docsRes] = await Promise.all([
      api.getBiomarkerResults({ limit: 200 }),
      api.getDocuments(),
    ]);
    if (resultsRes.data) setResults(resultsRes.data as BiomarkerResult[]);
    if (docsRes.data) setDocuments(docsRes.data as Document[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  // Poll while any document is still processing
  useEffect(() => {
    const processing = documents.some(
      d => d.parse_status === 'pending' || d.parse_status === 'processing'
    );
    if (!processing) { setPolling(false); return; }
    setPolling(true);
    const timer = setInterval(loadData, 4000);
    return () => clearInterval(timer);
  }, [documents, loadData]);

  async function handleUpload() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    setUploading(true);
    const { data, error } = await api.uploadDocument(file.uri, file.name);
    setUploading(false);

    if (error) {
      Alert.alert('Upload failed', error);
    } else {
      Alert.alert(
        'PDF uploaded',
        'Claude is reading your lab results. This takes about 15–30 seconds.',
        [{ text: 'OK' }]
      );
      loadData();
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Group results by category
  const grouped: Record<string, BiomarkerResult[]> = {};
  results.forEach((r: any) => {
    const cat = r.biomarker_definitions?.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  });

  const processingDocs = documents.filter(
    d => d.parse_status === 'pending' || d.parse_status === 'processing'
  );
  const failedDocs = documents.filter(d => d.parse_status === 'failed');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(); }}
        />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Lab Results</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.uploadBtnText}>+ Upload PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Processing banner */}
      {processingDocs.length > 0 && (
        <View style={styles.processingBanner}>
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.processingText}>
            Reading your lab results… pull down to refresh.
          </Text>
        </View>
      )}

      {/* Failed banner */}
      {failedDocs.map(doc => (
        <View key={doc.id} style={styles.failedBanner}>
          <Text style={styles.failedText}>
            Failed to parse "{doc.file_name}". Try uploading again.
          </Text>
        </View>
      ))}

      {/* Results summary */}
      {results.length > 0 && (
        <View style={styles.summaryRow}>
          {(['optimal', 'normal', 'borderline', 'abnormal'] as const).map(status => {
            const count = results.filter(r => r.status === status).length;
            if (!count) return null;
            return (
              <View key={status} style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <Text style={styles.summaryCount}>{count}</Text>
                <Text style={styles.summaryLabel}>{STATUS_LABELS[status]}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty state */}
      {results.length === 0 && processingDocs.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No lab results yet</Text>
          <Text style={styles.emptyText}>
            Upload a PDF from your doctor or lab and Claude will extract and organize your biomarkers automatically.
          </Text>
        </View>
      )}

      {/* Results by category */}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>{category}</Text>
            {items
              .sort((a, b) => (a.normalized_name || a.raw_name).localeCompare(b.normalized_name || b.raw_name))
              .map(item => {
                const color = STATUS_COLORS[item.status] || Colors.unknown;
                const hasRange = item.reference_range_low != null && item.reference_range_high != null;
                return (
                  <View key={item.id} style={styles.resultCard}>
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultName}>
                        {item.normalized_name || item.raw_name}
                      </Text>
                      {hasRange && (
                        <Text style={styles.resultRange}>
                          Range: {item.reference_range_low} – {item.reference_range_high} {item.unit}
                        </Text>
                      )}
                      <Text style={styles.resultDate}>
                        {new Date(item.lab_date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.resultRight}>
                      <Text style={[styles.resultValue, { color }]}>
                        {item.value}
                      </Text>
                      <Text style={styles.resultUnit}>{item.unit}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.statusText, { color }]}>
                          {STATUS_LABELS[item.status]}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingTop: Spacing.xxxl, paddingBottom: Spacing.xxxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  heading: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  uploadBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: {
    color: Colors.white,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  processingText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },

  failedBanner: {
    backgroundColor: Colors.error + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  failedText: {
    fontSize: Typography.size.sm,
    color: Colors.error,
  },

  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  summaryCount: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  categorySection: { marginBottom: Spacing.base },
  categoryLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  resultLeft: { flex: 1, paddingRight: Spacing.sm },
  resultName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  resultRange: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  resultDate: {
    fontSize: Typography.size.xs,
    color: Colors.textDisabled,
  },
  resultRight: { alignItems: 'flex-end' },
  resultValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  resultUnit: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
});
