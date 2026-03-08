import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../lib/store';
import { Card } from '../components/Card';
import { TutorSelector } from '../components/TutorSelector';
import { getAIChatResponse } from '../lib/api';
import { aiTutors } from '../lib/mockData';
import { useTheme } from '../lib/useTheme';

export const ChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, chatMessages, addChatMessage, clearChat } = useAppStore();
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showTutorSelector, setShowTutorSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setSelectedImageBase64(result.assets[0].base64 || null);
    }
  };

  const currentTutor = aiTutors.find(t => t.id === user.selectedTutor) || aiTutors[0];

  useEffect(() => {
    if (chatMessages.length === 0) {
      // Send initial greeting
      setTimeout(() => {
        addChatMessage('assistant', currentTutor.greeting);
      }, 500);
    }
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() && !imageUri) return;

    const userMessage = inputText.trim() || 'Please analyze this image';
    const imageToSend = selectedImageBase64;

    setInputText('');
    setImageUri(null);
    setSelectedImageBase64(null);

    addChatMessage('user', imageToSend ? `📷 [Image Sent]\n${userMessage}` : userMessage);
    setIsTyping(true);

    try {
      const response = await getAIChatResponse(
        userMessage,
        currentTutor.style,
        currentTutor.name,
        chatMessages.map(m => ({ role: m.role, content: m.content })),
        imageToSend || undefined
      );
      addChatMessage('assistant', response);
    } catch (error) {
      addChatMessage(
        'assistant',
        `Sorry, I'm having trouble connecting right now. Please check your internet connection and try again! 🔄`
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'study-method':
        message = 'Can you suggest a study method for me?';
        break;
      case 'help-math':
        message = 'I need help with math';
        break;
      case 'test-prep':
        message = 'I have a test coming up';
        break;
      case 'motivation':
        message = 'I need some motivation to study';
        break;
    }
    setInputText(message);
  };

  const isPremiumTutor = user.plan === 'free' && user.selectedTutor !== 'sophia';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTutorSelector(!showTutorSelector)} style={styles.tutorSelectorTrigger}>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorAvatar}>{currentTutor.avatar}</Text>
              <View>
                <Text style={[styles.tutorName, { color: theme.text }]}>{currentTutor.name}</Text>
                <Text style={[styles.tutorStyle, { color: theme.textSecondary }]}>{currentTutor.style} tutor</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tutor Selector */}
        {showTutorSelector && (
          <View style={[styles.tutorSelectorContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.selectorTitle, { color: theme.textSecondary }]}>Choose Your AI Tutor</Text>
            <TutorSelector onSelect={() => setShowTutorSelector(false)} />
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeAvatar}>{currentTutor.avatar}</Text>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>Chat with {currentTutor.name}</Text>
              <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>{currentTutor.personality}</Text>

              <View style={styles.specialtiesContainer}>
                <Text style={[styles.specialtiesTitle, { color: theme.textSecondary }]}>Specialties:</Text>
                <View style={styles.specialtiesList}>
                  {currentTutor.specialties.map((specialty, index) => (
                    <View key={index} style={[styles.specialtyBadge, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.specialtyText, { color: theme.primary }]}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.quickActionsContainer}>
                <Text style={[styles.quickActionsTitle, { color: theme.textSecondary }]}>Quick Actions:</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[styles.quickActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => handleQuickAction('study-method')}
                  >
                    <Ionicons name="bulb" size={18} color={theme.warning} />
                    <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Study Method</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('help-math')}
                  >
                    <Ionicons name="calculator" size={18} color="#3B82F6" />
                    <Text style={styles.quickActionText}>Help with Math</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('test-prep')}
                  >
                    <Ionicons name="document-text" size={18} color="#8B5CF6" />
                    <Text style={styles.quickActionText}>Test Prep</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction('motivation')}
                  >
                    <Ionicons name="heart" size={18} color="#EC4899" />
                    <Text style={styles.quickActionText}>Motivation</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {chatMessages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={FadeInUp.delay(index * 50).duration(300)}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.role === 'assistant' && (
                <Text style={styles.messageAvatar}>{currentTutor.avatar}</Text>
              )}
              <View style={[
                styles.messageContent,
                message.role === 'user' ? styles.userContent : [styles.assistantContent, { backgroundColor: theme.card }],
              ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : { color: theme.text },
                ]}>
                  {message.content}
                </Text>
              </View>
            </Animated.View>
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <Text style={styles.messageAvatar}>{currentTutor.avatar}</Text>
              <View style={[styles.typingBubble, { backgroundColor: theme.card }]}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: theme.textMuted }]} />
                  <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: theme.textMuted }]} />
                  <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: theme.textMuted }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Voice Tutor Banner (Pro Only) */}
        {user.plan !== 'pro' && (
          <TouchableOpacity
            style={[styles.voiceBanner, { backgroundColor: theme.accent + '20' }]}
            onPress={() => navigation.navigate('Upgrade')}
          >
            <Ionicons name="mic" size={18} color={theme.accent} />
            <Text style={[styles.voiceBannerText, { color: theme.accent }]}>Voice AI Tutors available on Pro</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.accent} />
          </TouchableOpacity>
        )}

        {/* Input */}
        <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => { setImageUri(null); setSelectedImageBase64(null); }}>
                <Ionicons name="close-circle" size={24} color={theme.danger} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.background }]} onPress={pickImage}>
              <Ionicons name="camera" size={24} color={theme.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Ask me anything..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              placeholderTextColor={theme.textMuted}
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.primary }, (!inputText.trim() && !imageUri || isTyping) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={(!inputText.trim() && !imageUri || isTyping) as boolean}
            >
              <Ionicons name="send" size={20} color={(inputText.trim() || imageUri) ? '#FFFFFF' : theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tutorAvatar: {
    fontSize: 32,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tutorStyle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  clearButton: {
    padding: 8,
  },
  tutorSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  welcomeAvatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  specialtiesContainer: {
    marginBottom: 24,
  },
  specialtiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  quickActionsContainer: {
    width: '100%',
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    fontSize: 24,
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userContent: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  assistantContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  voiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EDE9FE',
    paddingVertical: 10,
  },
  voiceBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D28D9',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    gap: 10,
  },
  cameraButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
  },
  imagePreviewContainer: {
    padding: 12,
    paddingBottom: 0,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});