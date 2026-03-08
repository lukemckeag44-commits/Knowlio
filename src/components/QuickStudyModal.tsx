import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { Button } from './Button';
import { Card } from './Card';
import { generateQuickStudyContent } from '@/lib/aiResponses';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';

interface QuickStudyModalProps {
  visible: boolean;
  onClose: () => void;
  subject?: string;
}

export const QuickStudyModal: React.FC<QuickStudyModalProps> = ({
  visible,
  onClose,
  subject = 'math',
}) => {
  const [selectedTime, setSelectedTime] = useState<2 | 5 | 10>(5);
  const [isStudying, setIsStudying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [content, setContent] = useState<{ title: string; points: string[]; tips: string[] } | null>(null);
  const { user, addStudyTime } = useAppStore();
  const theme = useTheme();

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isStudying) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isStudying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStudying) {
      setIsStudying(false);
      addStudyTime(selectedTime);
    }
    return () => clearInterval(interval);
  }, [isStudying, timeLeft]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const startStudy = () => {
    setContent(generateQuickStudyContent(subject, selectedTime));
    setTimeLeft(selectedTime * 60);
    setIsStudying(true);
  };

  const formatTimeLeft = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsStudying(false);
    setContent(null);
    setTimeLeft(0);
    onClose();
  };

  const isPremiumFeature = user.plan === 'free';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="flash" size={24} color={theme.warning} />
              <Text style={[styles.title, { color: theme.text }]}>Quick Study</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {isPremiumFeature ? (
            <View style={styles.premiumBlock}>
              <Ionicons name="lock-closed" size={48} color={theme.warning} />
              <Text style={[styles.premiumTitle, { color: theme.text }]}>Plus Feature</Text>
              <Text style={[styles.premiumText, { color: theme.textSecondary }]}>
                Quick Study is available on Plus and Pro plans. Upgrade to cram effectively!
              </Text>
              <Button title="Upgrade Now" onPress={handleClose} style={{ marginTop: 16 }} />
            </View>
          ) : !isStudying ? (
            <>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Cram the most important concepts in a short time. Select your study duration:
              </Text>

              <View style={styles.timeOptions}>
                {([2, 5, 10] as const).map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      selectedTime === time && [styles.timeOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }],
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        { color: theme.textMuted },
                        selectedTime === time && [styles.timeOptionTextSelected, { color: theme.primary }],
                      ]}
                    >
                      {time} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Card style={[styles.infoCard, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
                <Ionicons name="information-circle" size={20} color={theme.primary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  We'll show you the most critical {subject} concepts you need to remember.
                </Text>
              </Card>

              <Button
                title="Start Quick Study"
                onPress={startStudy}
                size="large"
                icon={<Ionicons name="flash" size={20} color="#FFFFFF" />}
                style={styles.startButton}
              />
            </>
          ) : (
            <ScrollView style={styles.studyContent} showsVerticalScrollIndicator={false}>
              <Animated.View style={[styles.timerContainer, pulseStyle]}>
                <Text style={[styles.timerLabel, { color: theme.textMuted }]}>Time Remaining</Text>
                <Text style={[styles.timer, { color: theme.primary }]}>{formatTimeLeft()}</Text>
              </Animated.View>

              {content && (
                <>
                  <Text style={[styles.contentTitle, { color: theme.text }]}>{content.title}</Text>

                  <View style={styles.pointsContainer}>
                    {content.points.map((point, index) => (
                      <Card key={index} style={[styles.pointCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.pointText, { color: theme.text }]}>{point}</Text>
                      </Card>
                    ))}
                  </View>

                  <Text style={[styles.tipsTitle, { color: theme.text }]}>Quick Tips:</Text>
                  {content.tips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Ionicons name="bulb" size={16} color={theme.warning} />
                      <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
                    </View>
                  ))}
                </>
              )}

              <Button
                title="End Session"
                onPress={handleClose}
                variant="outline"
                style={styles.endButton}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 16,
    lineHeight: 22,
  },
  timeOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  timeOption: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  timeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeOptionTextSelected: {
    color: '#3B82F6',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  studyContent: {
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3B82F6',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  pointsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  pointCard: {
    backgroundColor: '#F9FAFB',
  },
  pointText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  endButton: {
    marginTop: 24,
  },
  premiumBlock: {
    alignItems: 'center',
    padding: 40,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  premiumText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
