import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
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
        `I'm having a bit of trouble connecting to the network. Could you please try again? 🔄`
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowTutorSelector(!showTutorSelector)} 
            style={styles.tutorHeader}
            activeOpacity={0.7}
          >
            <View style={styles.tutorAvatarContainer}>
              <Text style={styles.tutorAvatar}>{currentTutor.avatar}</Text>
            </View>
            <View style={styles.tutorTextContainer}>
              <Text style={[styles.tutorName, { color: theme.text }]}>{currentTutor.name}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.onlineDot} />
                <Text style={[styles.tutorStatus, { color: theme.textSecondary }]}>Active Now</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
            <Ionicons name="refresh-outline" size={22} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tutor Selector Modal/Overlay */}
        {showTutorSelector && (
          <Animated.View entering={FadeIn} style={[styles.selectorOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTutorSelector(false)} />
            <View style={[styles.selectorContent, { backgroundColor: theme.card }]}>
              <View style={[styles.selectorHandle, { backgroundColor: theme.border }]} />
              <Text style={[styles.selectorTitle, { color: theme.text }]}>Switch AI Tutor</Text>
              <TutorSelector onSelect={() => setShowTutorSelector(false)} />
            </View>
          </Animated.View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={FadeInUp.delay(50).duration(400)}
              style={[
                styles.messageRow,
                message.role === 'user' ? styles.userRow : styles.assistantRow,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.messageAvatarSmall}>
                  <Text style={{ fontSize: 18 }}>{currentTutor.avatar}</Text>
                </View>
              )}
              <View style={[
                styles.messageBubble,
                message.role === 'user' 
                  ? [styles.userBubble, { backgroundColor: theme.primary }] 
                  : [styles.assistantBubble, { backgroundColor: theme.input, borderColor: theme.border }],
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
            <View style={styles.assistantRow}>
              <View style={styles.messageAvatarSmall}>
                <Text style={{ fontSize: 18 }}>{currentTutor.avatar}</Text>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
                  <View style={[styles.typingDot, { backgroundColor: theme.textMuted, opacity: 0.6 }]} />
                  <View style={[styles.typingDot, { backgroundColor: theme.textMuted, opacity: 0.3 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImage} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <Ionicons name="camera-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
              placeholder="Ask anything..."
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={100}
            />
            
            <TouchableOpacity 
              onPress={handleSend} 
              disabled={!inputText.trim() && !imageUri}
              style={[
                styles.sendButton, 
                { backgroundColor: (inputText.trim() || imageUri) ? theme.primary : theme.border }
              ]}
            >
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: { padding: 8 },
  tutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tutorAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tutorAvatar: { fontSize: 20 },
  tutorTextContainer: { marginRight: 6 },
  tutorName: { fontSize: 15, fontWeight: '700' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  tutorStatus: { fontSize: 11, fontWeight: '600' },

  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 32 },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  assistantRow: { alignSelf: 'flex-start' },
  messageAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },

  typingBubble: {
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3 },

  inputContainer: {
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { padding: 4 },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    marginBottom: 10,
    position: 'relative',
    width: 60,
  },
  imagePreview: { width: 60, height: 60, borderRadius: 8 },
  removeImage: { position: 'absolute', top: -8, right: -8 },

  selectorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  selectorContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  selectorHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  }
});
