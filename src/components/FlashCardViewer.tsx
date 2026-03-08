import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import { FlashCard, FlashCardDeck } from '@/lib/types';
import { Button } from './Button';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';

const { width } = Dimensions.get('window');

interface FlashCardViewerProps {
  deck: FlashCardDeck;
  onClose: () => void;
}

export const FlashCardViewer: React.FC<FlashCardViewerProps> = ({ deck, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { updateFlashCardScore } = useAppStore();
  const theme = useTheme();

  const flipProgress = useSharedValue(0);

  const currentCard = deck.cards[currentIndex];
  const isComplete = currentIndex >= deck.cards.length;

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const handleFlip = () => {
    flipProgress.value = withTiming(showAnswer ? 0 : 1, { duration: 300 });
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = (correct: boolean) => {
    updateFlashCardScore(deck.id, currentCard.id, correct);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Reset for next card
    flipProgress.value = 0;
    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.success;
      case 'medium': return theme.warning;
      case 'hard': return theme.danger;
      default: return theme.textMuted;
    }
  };

  if (isComplete) {
    const percentage = Math.round((score.correct / deck.cards.length) * 100);
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.completeContainer}>
          <View style={[styles.completeIcon, { backgroundColor: theme.warning + '20' }]}>
            <Ionicons
              name={percentage >= 70 ? 'trophy' : 'refresh'}
              size={48}
              color={percentage >= 70 ? theme.warning : theme.primary}
            />
          </View>
          <Text style={[styles.completeTitle, { color: theme.text }]}>
            {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
          </Text>
          <Text style={[styles.completeScore, { color: theme.primary }]}>{percentage}%</Text>
          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.scoreText, { color: theme.textSecondary }]}>{score.correct} Correct</Text>
            </View>
            <View style={styles.scoreItem}>
              <Ionicons name="close-circle" size={20} color={theme.danger} />
              <Text style={[styles.scoreText, { color: theme.textSecondary }]}>{score.incorrect} Incorrect</Text>
            </View>
          </View>
          <Button title="Done" onPress={onClose} style={styles.doneButton} />
          <Button
            title="Study Again"
            onPress={() => {
              setCurrentIndex(0);
              setScore({ correct: 0, incorrect: 0 });
            }}
            variant="outline"
            style={styles.againButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.textMuted} />
        </TouchableOpacity>
        <Text style={[styles.progress, { color: theme.text }]}>
          {currentIndex + 1} / {deck.cards.length}
        </Text>
        <View style={styles.scoreHeader}>
          <Text style={[styles.correctScore, { color: theme.success }]}>{score.correct}</Text>
          <Text style={[styles.scoreDivider, { color: theme.textMuted }]}>/</Text>
          <Text style={[styles.incorrectScore, { color: theme.danger }]}>{score.incorrect}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
          <View style={styles.cardWrapper}>
            <Animated.View style={[styles.card, styles.cardFront, { backgroundColor: theme.card, shadowColor: theme.shadow }, frontAnimatedStyle]}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentCard.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(currentCard.difficulty) }]}>
                  {currentCard.difficulty.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Question</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>{currentCard.question}</Text>
              <Text style={[styles.tapHint, { color: theme.textMuted }]}>Tap to reveal answer</Text>
            </Animated.View>

            <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: theme.primary + '10', shadowColor: theme.shadow }, backAnimatedStyle]}>
              <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Answer</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>{currentCard.answer}</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {showAnswer && (
        <View style={styles.answerButtons}>
          <TouchableOpacity
            style={[styles.answerButton, styles.incorrectButton, { backgroundColor: theme.danger }]}
            onPress={() => handleAnswer(false)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
            <Text style={styles.answerButtonText}>Got it Wrong</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerButton, styles.correctButton, { backgroundColor: theme.success }]}
            onPress={() => handleAnswer(true)}
          >
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            <Text style={styles.answerButtonText}>Got it Right</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  scoreDivider: {
    fontSize: 16,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  incorrectScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardWrapper: {
    width: width - 40,
    height: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
  },
  cardBack: {
    backgroundColor: '#EFF6FF',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 13,
    color: '#9CA3AF',
  },
  answerButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  incorrectButton: {
    backgroundColor: '#EF4444',
  },
  correctButton: {
    backgroundColor: '#10B981',
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  completeScore: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 24,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    fontSize: 16,
    color: '#4B5563',
  },
  doneButton: {
    width: '100%',
    marginBottom: 12,
  },
  againButton: {
    width: '100%',
  },
});
