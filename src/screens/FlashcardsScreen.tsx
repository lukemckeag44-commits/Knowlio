import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FlashCardViewer } from '@/components/FlashCardViewer';
import { getAIFlashcards } from '@/lib/api';
import { FlashCardDeck } from '@/lib/types';

export const FlashcardsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { flashCardDecks, addFlashCardDeck, addFlashCard, subjects, user } = useAppStore();
  const theme = useTheme();
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashCardDeck | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<FlashCardDeck | null>(null);

  // Create deck form
  const [deckName, setDeckName] = useState('');
  const [deckSubject, setDeckSubject] = useState('');

  // Add card form
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');

  const canCreateDeck = user.plan !== 'free' || flashCardDecks.length < 1;
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [generatorDeckId, setGeneratorDeckId] = useState<string | null>(null);

  const handleGenerateCards = () => {
    if (user.plan === 'free') {
      navigation.navigate('Upgrade');
      return;
    }
    if (flashCardDecks.length === 0) {
      Alert.alert('No Decks', 'Create a flashcard deck first before generating cards.');
      return;
    }
    setGeneratorDeckId(flashCardDecks[0].id);
    setShowAIGenerator(true);
  };

  const handleConfirmGenerate = async () => {
    if (!aiNotes.trim() || !generatorDeckId) return;
    setIsGeneratingCards(true);

    try {
      const cards = await getAIFlashcards(aiNotes);

      if (cards.length === 0) {
        Alert.alert('No Cards Generated', 'Try pasting more detailed notes or a longer paragraph.');
        return;
      }

      cards.forEach((card) => {
        addFlashCard(generatorDeckId!, card.question, card.answer);
      });

      setShowAIGenerator(false);
      setAiNotes('');
      Alert.alert('Done! 🎉', `Generated ${cards.length} AI flashcards from your notes!`);
    } catch (error) {
      Alert.alert('Error', 'Could not connect to AI. Please check your internet and try again.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleCreateDeck = () => {
    if (deckName.trim() && deckSubject) {
      const subject = subjects.find(s => s.name === deckSubject);
      addFlashCardDeck(deckName.trim(), subject?.id || '1');
      setDeckName('');
      setDeckSubject('');
      setShowCreateDeck(false);
    }
  };

  const handleAddCard = () => {
    if (selectedDeck && cardQuestion.trim() && cardAnswer.trim()) {
      addFlashCard(selectedDeck.id, cardQuestion.trim(), cardAnswer.trim());
      setCardQuestion('');
      setCardAnswer('');
      setShowAddCard(false);
    }
  };

  const getSubjectForDeck = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const getMasteryPercentage = (deck: FlashCardDeck) => {
    if (deck.cards.length === 0) return 0;
    const masteredCards = deck.cards.filter(c => c.correctCount > c.incorrectCount).length;
    return Math.round((masteredCards / deck.cards.length) * 100);
  };

  if (studyingDeck) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <FlashCardViewer
          deck={studyingDeck}
          onClose={() => setStudyingDeck(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Flashcards</Text>
          <TouchableOpacity
            onPress={() => canCreateDeck ? setShowCreateDeck(true) : navigation.navigate('Upgrade')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Usage Limit */}
        {user.plan === 'free' && (
          <Card style={[styles.limitCard, { backgroundColor: theme.warning + '20', borderColor: theme.warning + '40' }]}>
            <Ionicons name="information-circle" size={20} color={theme.warning} />
            <Text style={[styles.limitText, { color: theme.warning }]}>
              Free plan: {flashCardDecks.length}/1 deck. Upgrade for unlimited decks.
            </Text>
          </Card>
        )}

        {/* Decks Grid */}
        <View style={styles.decksContainer}>
          {flashCardDecks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
                <Ionicons name="albums-outline" size={48} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Flashcard Decks</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Create your first deck to start studying with flashcards.
              </Text>
              <Button
                title="Create Deck"
                onPress={() => setShowCreateDeck(true)}
                icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
                style={styles.createButton}
              />
            </Card>
          ) : (
            flashCardDecks.map((deck) => {
              const subject = getSubjectForDeck(deck.subjectId);
              const mastery = getMasteryPercentage(deck);

              return (
                <Card key={deck.id} style={styles.deckCard}>
                  <TouchableOpacity
                    onPress={() => setSelectedDeck(deck)}
                    style={styles.deckContent}
                  >
                    <View style={styles.deckHeader}>
                      <View style={[
                        styles.deckIcon,
                        { backgroundColor: (subject?.color || '#3B82F6') + '20' },
                      ]}>
                        <Ionicons name="albums" size={24} color={subject?.color || '#3B82F6'} />
                      </View>
                      <View style={styles.deckInfo}>
                        <Text style={[styles.deckName, { color: theme.text }]}>{deck.name}</Text>
                        <Text style={[styles.deckSubject, { color: theme.textSecondary }]}>{subject?.name || 'General'}</Text>
                      </View>
                    </View>

                    <View style={styles.deckStats}>
                      <View style={styles.deckStat}>
                        <Text style={[styles.deckStatValue, { color: theme.text }]}>{deck.cards.length}</Text>
                        <Text style={[styles.deckStatLabel, { color: theme.textMuted }]}>Cards</Text>
                      </View>
                      <View style={styles.deckStat}>
                        <Text style={[
                          styles.deckStatValue,
                          { color: mastery >= 70 ? theme.success : mastery >= 40 ? theme.warning : theme.danger },
                        ]}>
                          {mastery}%
                        </Text>
                        <Text style={[styles.deckStatLabel, { color: theme.textMuted }]}>Mastery</Text>
                      </View>
                    </View>

                    <View style={styles.deckActions}>
                      <TouchableOpacity
                        style={[styles.deckActionButton, { backgroundColor: theme.primary + '20' }]}
                        onPress={() => {
                          setSelectedDeck(deck);
                          setShowAddCard(true);
                        }}
                      >
                        <Ionicons name="add" size={18} color={theme.primary} />
                        <Text style={[styles.deckActionText, { color: theme.primary }]}>Add Card</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.deckActionButton, styles.studyButton, { backgroundColor: theme.primary }]}
                        onPress={() => deck.cards.length > 0 && setStudyingDeck(deck)}
                        disabled={deck.cards.length === 0}
                      >
                        <Ionicons name="play" size={18} color="#FFFFFF" />
                        <Text style={styles.studyButtonText}>Study</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </View>

        {/* AI Flashcard Generator */}
        <Card style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={24} color={theme.secondary} />
            <View style={styles.aiInfo}>
              <Text style={[styles.aiTitle, { color: theme.text }]}>AI Flashcard Generator</Text>
              <Text style={[styles.aiSubtitle, { color: theme.textSecondary }]}>Auto-generate cards from your notes</Text>
            </View>
            {user.plan === 'free' && (
              <View style={[styles.proBadge, { backgroundColor: theme.secondary }]}>
                <Text style={styles.proText}>PLUS</Text>
              </View>
            )}
          </View>
          <Button
            title={user.plan === 'free' ? 'Upgrade to Use' : 'Generate Cards'}
            onPress={handleGenerateCards}
            variant={user.plan === 'free' ? 'outline' : 'primary'}
            icon={<Ionicons name="sparkles" size={18} color={user.plan === 'free' ? theme.primary : '#FFFFFF'} />}
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Generator Modal */}
      <Modal visible={showAIGenerator} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>AI Card Generator ✨</Text>
              <TouchableOpacity onPress={() => setShowAIGenerator(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {flashCardDecks.length > 1 && (
              <>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Add cards to deck</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectSelector}>
                  {flashCardDecks.map((deck) => (
                    <TouchableOpacity
                      key={deck.id}
                      style={[
                        styles.subjectOption,
                        { borderColor: theme.border, backgroundColor: theme.background },
                        generatorDeckId === deck.id && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
                      ]}
                      onPress={() => setGeneratorDeckId(deck.id)}
                    >
                      <Text style={[
                        styles.subjectOptionText,
                        { color: theme.textSecondary },
                        generatorDeckId === deck.id && { color: theme.primary },
                      ]}>{deck.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Paste your notes or topic</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="Paste your class notes, a paragraph from a textbook, or describe the topic..."
              value={aiNotes}
              onChangeText={setAiNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={theme.textMuted}
            />

            <Button
              title={isGeneratingCards ? 'Generating...' : 'Generate Flashcards'}
              onPress={handleConfirmGenerate}
              disabled={!aiNotes.trim() || !generatorDeckId || isGeneratingCards}
              loading={isGeneratingCards}
              icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Create Deck Modal */}
      <Modal visible={showCreateDeck} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Deck</Text>
              <TouchableOpacity onPress={() => setShowCreateDeck(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Deck Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="e.g., Quadratic Equations"
              value={deckName}
              onChangeText={setDeckName}
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectSelector}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectOption,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    deckSubject === subject.name && {
                      backgroundColor: subject.color + '20',
                      borderColor: subject.color,
                    },
                  ]}
                  onPress={() => setDeckSubject(subject.name)}
                >
                  <Text style={[
                    styles.subjectOptionText,
                    { color: theme.textSecondary },
                    deckSubject === subject.name && { color: subject.color },
                  ]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Create Deck"
              onPress={handleCreateDeck}
              disabled={!deckName.trim() || !deckSubject}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Flashcard</Text>
              <TouchableOpacity onPress={() => setShowAddCard(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Question</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="Enter your question..."
              value={cardQuestion}
              onChangeText={setCardQuestion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Answer</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="Enter the answer..."
              value={cardAnswer}
              onChangeText={setCardAnswer}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={theme.textMuted}
            />

            <Button
              title="Add Card"
              onPress={handleAddCard}
              disabled={!cardQuestion.trim() || !cardAnswer.trim()}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    padding: 4,
  },
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  limitText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  decksContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  deckCard: {
    marginBottom: 12,
  },
  deckContent: {
    gap: 16,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckInfo: {
    marginLeft: 12,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deckSubject: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  deckStats: {
    flexDirection: 'row',
    gap: 24,
  },
  deckStat: {
    alignItems: 'center',
  },
  deckStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  deckStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  deckActions: {
    flexDirection: 'row',
    gap: 10,
  },
  deckActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  deckActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  studyButton: {
    backgroundColor: '#3B82F6',
  },
  studyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiInfo: {
    flex: 1,
    marginLeft: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 80,
  },
  subjectSelector: {
    marginBottom: 16,
  },
  subjectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  subjectOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  modalButton: {
    marginTop: 8,
  },
});
