import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { z } from 'zod';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, FadeIn, SlideInDown } from 'react-native-reanimated';
import { aiTutors } from '@/lib/mockData';
import { useTheme } from '@/lib/useTheme';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const emailSchema = z.string().email("Please enter a valid email address");

export default function LoginScreen() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [grade, setGrade] = useState<number>(10);
    const [selectedTutor, setSelectedTutorId] = useState<string>(aiTutors[0].id);

    const setLogin = useAuthStore((state) => state.setLogin);
    const updateUser = useAppStore((state) => state.updateUser);
    const theme = useTheme();

    const handleNext = () => {
        if (step === 1) {
            try {
                emailSchema.parse(email);
                if (password.length < 6) {
                    Alert.alert("Security", "Password must be at least 6 characters.");
                    return;
                }
                setStep(2);
            } catch (err) {
                if (err instanceof z.ZodError) {
                    Alert.alert("Invalid Email", err.errors[0].message);
                }
            }
        } else if (step === 2) {
            if (!name.trim()) {
                Alert.alert("Required", "Please tell us your name.");
                return;
            }
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            completeLogin();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const completeLogin = async () => {
        try {
            updateUser({
                name: name.trim(),
                email: email.trim(),
                grade: grade,
                selectedTutor: selectedTutor,
            });
            await setLogin(email);
        } catch (error) {
            Alert.alert("Login Error", "Failed to complete setup.");
        }
    };

    const renderStepIndicators = () => (
        <View style={styles.indicatorContainer}>
            {[1, 2, 3, 4].map(i => (
                <View 
                    key={i} 
                    style={[
                        styles.indicator, 
                        { backgroundColor: theme.border }, 
                        step >= i && { backgroundColor: theme.primary, width: 24 }
                    ]} 
                />
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={[theme.primary + '10', 'transparent']}
                style={StyleSheet.absoluteFill}
            />
            
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <Animated.View 
                        entering={FadeIn.duration(800)}
                        style={[styles.mainContent]}
                    >
                        <View style={styles.cardHeader}>
                            {step > 1 ? (
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <Ionicons name="arrow-back" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            ) : <View style={{ width: 24 }} />}
                            
                            {renderStepIndicators()}
                            
                            <View style={{ width: 24 }} />
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            {step === 1 && (
                                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                    <View style={styles.logoSection}>
                                        <Logo size={100} />
                                        <Text style={[styles.brandTitle, { color: theme.text }]}>Knowlio</Text>
                                        <Text style={[styles.brandTagline, { color: theme.textSecondary }]}>Elevate Your Academic Potential</Text>
                                    </View>

                                    <View style={styles.formSection}>
                                        <View style={styles.inputWrapper}>
                                            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                                                placeholder="alex@example.com"
                                                value={email}
                                                onChangeText={setEmail}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                placeholderTextColor={theme.textMuted}
                                            />
                                        </View>

                                        <View style={styles.inputWrapper}>
                                            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                                                placeholder="••••••••"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry
                                                placeholderTextColor={theme.textMuted}
                                            />
                                        </View>
                                    </View>
                                </Animated.View>
                            )}

                            {step === 2 && (
                                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                    <Text style={[styles.title, { color: theme.text }]}>What's your name?</Text>
                                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>We'll use this to personalize your learning journey.</Text>

                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                                            placeholder="Enter your name"
                                            value={name}
                                            onChangeText={setName}
                                            autoCapitalize="words"
                                            placeholderTextColor={theme.textMuted}
                                            autoFocus
                                        />
                                    </View>
                                </Animated.View>
                            )}

                            {step === 3 && (
                                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                    <Text style={[styles.title, { color: theme.text }]}>Current Grade</Text>
                                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>This helps us tailor study materials to your level.</Text>

                                    <View style={styles.gradeGrid}>
                                        {[9, 10, 11, 12, 13].map(g => (
                                            <TouchableOpacity
                                                key={g}
                                                activeOpacity={0.7}
                                                style={[
                                                    styles.gradeItem,
                                                    { borderColor: theme.border, backgroundColor: theme.input },
                                                    grade === g && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                                                ]}
                                                onPress={() => setGrade(g)}
                                            >
                                                <Text style={[
                                                    styles.gradeText, 
                                                    { color: theme.textSecondary }, 
                                                    grade === g && { color: theme.primary, fontWeight: '800' }
                                                ]}>
                                                    {g === 13 ? 'College' : `Grade ${g}`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </Animated.View>
                            )}

                            {step === 4 && (
                                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                    <Text style={[styles.title, { color: theme.text }]}>Select AI Tutor</Text>
                                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pick the personality that best fits your style.</Text>

                                    {aiTutors.map((tutor) => (
                                        <TouchableOpacity
                                            key={tutor.id}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.tutorCard,
                                                { borderColor: theme.border, backgroundColor: theme.input },
                                                selectedTutor === tutor.id && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                                            ]}
                                            onPress={() => setSelectedTutorId(tutor.id)}
                                        >
                                            <View style={styles.tutorAvatarBox}>
                                                <Text style={styles.tutorEmoji}>{tutor.avatar}</Text>
                                            </View>
                                            <View style={styles.tutorDetails}>
                                                <Text style={[
                                                    styles.tutorName, 
                                                    { color: theme.text }, 
                                                    selectedTutor === tutor.id && { color: theme.primary }
                                                ]}>{tutor.name}</Text>
                                                <Text style={[styles.tutorBio, { color: theme.textSecondary }]} numberOfLines={2}>
                                                    {tutor.personality}
                                                </Text>
                                            </View>
                                            {selectedTutor === tutor.id && (
                                                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </Animated.View>
                            )}
                        </ScrollView>

                        <Animated.View entering={SlideInDown.delay(200)} style={styles.footer}>
                            <Button 
                                title={step === 4 ? "Get Started" : "Continue"} 
                                onPress={handleNext}
                                variant="primary"
                                size="large"
                                style={styles.actionButton}
                            />
                            
                            {step === 1 && (
                                <TouchableOpacity 
                                    style={styles.forgotPass}
                                    onPress={() => Alert.alert("Reset Password", "A recovery link has been sent to your email.")}
                                >
                                    <Text style={[styles.forgotPassText, { color: theme.textMuted }]}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    mainContent: { flex: 1, paddingHorizontal: 24 },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    backButton: { padding: 4 },
    indicatorContainer: { flexDirection: 'row', gap: 6 },
    indicator: { width: 12, height: 6, borderRadius: 3 },
    scrollContent: { flexGrow: 1, paddingBottom: 30 },
    stepContainer: { flex: 1 },
    logoSection: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    brandTitle: { fontSize: 32, fontWeight: '900', marginTop: 16, letterSpacing: -1 },
    brandTagline: { fontSize: 16, fontWeight: '500', marginTop: 4, opacity: 0.8 },
    formSection: { gap: 20 },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 32 },
    inputWrapper: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
    input: { padding: 18, borderRadius: 16, borderWidth: 1, fontSize: 16 },
    gradeGrid: { gap: 12 },
    gradeItem: { padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    gradeText: { fontSize: 16, fontWeight: '700' },
    tutorCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
    tutorAvatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    tutorEmoji: { fontSize: 32 },
    tutorDetails: { flex: 1 },
    tutorName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
    tutorBio: { fontSize: 13, lineHeight: 18 },
    footer: { paddingVertical: 24, borderTopWidth: 0 },
    actionButton: { width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
    forgotPass: { marginTop: 16, alignItems: 'center' },
    forgotPassText: { fontSize: 14, fontWeight: '600' }
});
