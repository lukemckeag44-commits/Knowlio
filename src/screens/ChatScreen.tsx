import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn, SlideInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '@/lib/store';
import { TutorSelector } from '@/components/TutorSelector';
import { getAIChatResponse } from '@/lib/api';
import { aiTutors } from '@/lib/mockData';
import { useTheme } from '@/lib/useTheme';

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
            <Ionicons name="chevron-back" size={26} color={theme.text} />
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

        {/* Tutor Selector Overlay */}
        {showTutorSelector && (
          <Animated.View entering={FadeIn} style={[styles.selectorOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTutorSelector(false)} />
            <Animated.View entering={SlideInDown} style={[styles.selectorContent, { backgroundColor: theme.card }]}>
              <View style={[styles.selectorHandle, { backgroundColor: theme.border }]} />
              <Text style={[styles.selectorTitle, { color: theme.text }]}>Switch AI Tutor</Text>
              <TutorSelector onSelect={() => setShowTutorSelector(false)} />
            </Animated.View>
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
              <Ionicons name="camera-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
              placeholder="Ask anything..."
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={120}
            />
            
            <TouchableOpacity 
              onPress={handleSend} 
              disabled={!inputText.trim() && !imageUri}
              style={[
                styles.sendButton, 
                { backgroundColor: (inputText.trim() || imageUri) ? theme.primary : theme.border }
              ]}
            >
              <Ionicons name="arrow-up" size={22} color="#FFF" />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: { padding: 6 },
  tutorHeader: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  tutorAvatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tutorAvatar: { fontSize: 22 },
  tutorTextContainer: { marginRight: 8 },
  tutorName: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981', marginRight: 5 },
  tutorStatus: { fontSize: 11, fontWeight: '700', opacity: 0.8 },

  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '88%' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  assistantRow: { alignSelf: 'flex-start' },
  messageAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 10, alignSelf: 'flex-end', borderWidth: 1, borderColor: '#E2E8F0' },
  messageBubble: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  userBubble: { borderBottomRightRadius: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 3 } }) },
  assistantBubble: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  userText: { color: '#FFFFFF' },

  typingBubble: { padding: 16, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1 },
  typingDots: { flexDirection: 'row', gap: 5 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },

  inputContainer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 4 },
  input: { flex: 1, borderRadius: 24, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12, paddingTop: 12, fontSize: 16, maxHeight: 120 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } }) },
  imagePreviewContainer: { marginBottom: 12, position: 'relative', width: 70 },
  imagePreview: { width: 70, height: 70, borderRadius: 12 },
  removeImage: { position: 'absolute', top: -10, right: -10, backgroundColor: '#FFF', borderRadius: 12 },

  selectorOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  selectorContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -10 } }, android: { elevation: 10 } }) },
  selectorHandle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 24, opacity: 0.5 },
  selectorTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 24, letterSpacing: -0.5 }
});
