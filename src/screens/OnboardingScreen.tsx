import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp, 
  FadeIn, 
  SlideInDown, 
  Layout 
} from 'react-native-reanimated';
import { useAppStore, useAuthStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const theme = useTheme();
  const { updateUser, addSubject } = useAppStore();
  const { setHasOnboarded } = useAuthStore();

  const [userData, setUserData] = useState({
    name: '',
    grade: '',
    subjects: '',
    goal: ''
  });

  const onboardingSteps = [
    {
      question: "Hi there! I'm your Knowlio assistant. I'm here to help you dominate your classes. First off, what's your name?",
      field: 'name',
    },
    {
      question: (name: string) => `Nice to meet you, ${name}! What grade are you in?`,
      field: 'grade',
    },
    {
      question: "Got it. And what are the main subjects you're studying right now? (e.g. Math, History, Physics...)",
      field: 'subjects',
    },
    {
      question: "Great. One last thing: what's your main goal for this semester? (e.g. Get an A in Math, stay organized, better study habits...)",
      field: 'goal',
    }
  ];

  useEffect(() => {
    sendAssistantMessage(onboardingSteps[0].question as string);
  }, []);

  const sendAssistantMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: text
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const currentMessage = inputText;
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      role: 'user',
      content: currentMessage
    }]);
    setInputText('');

    const currentStep = onboardingSteps[step];
    const updatedData = { ...userData, [currentStep.field]: currentMessage };
    setUserData(updatedData);

    if (step < onboardingSteps.length - 1) {
      const nextStep = onboardingSteps[step + 1];
      const nextQuestion = typeof nextStep.question === 'function' 
        ? nextStep.question(updatedData.name) 
        : nextStep.question;
      
      setTimeout(() => sendAssistantMessage(nextQuestion), 500);
      setStep(step + 1);
    } else {
      setTimeout(() => {
        sendAssistantMessage("Awesome! I've set everything up for you. Let's head to your dashboard.");
        
        // Save subjects
        const subjectList = updatedData.subjects.split(',').map(s => s.trim());
        subjectList.forEach(s => {
          if (s) addSubject(s, theme.primary, 'book');
        });

        setTimeout(() => {
          updateUser({
            name: updatedData.name,
            grade: parseInt(updatedData.grade) || 10,
          });
          setHasOnboarded(true);
        }, 1500);
      }, 500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <Animated.View 
              key={msg.id}
              entering={FadeInUp}
              layout={Layout.springify()}
              style={[
                styles.messageWrapper,
                msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper
              ]}
            >
              <View style={[
                styles.bubble,
                msg.role === 'user' ? 
                  [styles.userBubble, { backgroundColor: theme.primary }] : 
                  [styles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.border }]
              ]}>
                <Text style={[
                  styles.messageText,
                  { color: msg.role === 'user' ? '#FFFFFF' : theme.text }
                ]}>
                  {msg.content}
                </Text>
              </View>
            </Animated.View>
          ))}
          {isTyping && (
            <View style={styles.assistantWrapper}>
              <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ color: theme.textSecondary }}>...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={theme.textMuted}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  messageWrapper: { marginBottom: 15, flexDirection: 'row' },
  userWrapper: { justifyContent: 'flex-end' },
  assistantWrapper: { justifyContent: 'flex-start' },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  inputContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 22,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
