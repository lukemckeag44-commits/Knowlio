import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { z } from 'zod';
import { useAuthStore, useAppStore } from '../lib/store';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, FadeIn } from 'react-native-reanimated';
import { aiTutors } from '../lib/mockData';
import { useTheme } from '../lib/useTheme';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <SafeAreaView style={styles.safeArea}>
                <Animated.View 
                    entering={FadeIn.duration(600)}
                    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                    <View style={styles.cardHeader}>
                        {step > 1 ? (
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={22} color={theme.textSecondary} />
                            </TouchableOpacity>
                        ) : <View style={{ width: 22 }} />}
                        
                        {renderStepIndicators()}
                        
                        <View style={{ width: 22 }} />
                    </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                <View style={styles.logoContainer}>
                                    <Logo size={80} />
                                    <Text style={[styles.brandName, { color: theme.primary }]}>Knowlio</Text>
                                </View>
                                <Text style={[styles.title, { color: theme.text }]}>Elevate Your Learning</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to your personalized academic workspace</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email Address</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                                        placeholder="e.g. alex@example.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, backgroundColor: theme.input, borderColor: theme.border }]}
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                                <Text style={[styles.title, { color: theme.text, textAlign: 'left' }]}>What's your name?</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'left' }]}>Your AI tutor will use this to personalize your experience.</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Preferred Name</Text>
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
                                <Text style={[styles.title, { color: theme.text, textAlign: 'left' }]}>Current Grade</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'left' }]}>We'll tailor your study materials to your academic level.</Text>

                                <View style={styles.grid}>
                                    {[9, 10, 11, 12, 13].map(g => (
                                        <TouchableOpacity
                                            key={g}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.gridItem,
                                                { borderColor: theme.border, backgroundColor: theme.input },
                                                grade === g && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                                            ]}
                                            onPress={() => setGrade(g)}
                                        >
                                            <Text style={[
                                                styles.gridItemText, 
                                                { color: theme.textSecondary }, 
                                                grade === g && { color: theme.primary, fontWeight: '700' }
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
                                <Text style={[styles.title, { color: theme.text, textAlign: 'left' }]}>Choose your AI Tutor</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'left' }]}>Select the personality that best fits your learning style.</Text>

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
                                        <View style={styles.tutorAvatarContainer}>
                                            <Text style={styles.tutorAvatar}>{tutor.avatar}</Text>
                                        </View>
                                        <View style={styles.tutorInfo}>
                                            <Text style={[
                                                styles.tutorName, 
                                                { color: theme.text }, 
                                                selectedTutor === tutor.id && { color: theme.primary }
                                            ]}>{tutor.name}</Text>
                                            <Text style={[styles.tutorDesc, { color: theme.textSecondary }]} numberOfLines={2}>
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

                    <View style={styles.footer}>
                        <Button 
                            title={step === 4 ? "Complete Setup" : "Continue"} 
                            onPress={handleNext}
                            variant="primary"
                            size="large"
                            style={styles.nextButton}
                        />
                        
                        {step === 1 && (
                            <TouchableOpacity 
                                style={styles.forgotPassword}
                                onPress={() => Alert.alert("Reset Password", "A recovery link has been sent to your email (Demo).")}
                            >
                                <Text style={[styles.forgotPasswordText, { color: theme.textMuted }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

// Adding a simple SafeAreaView wrapper since it's commonly used
const SafeAreaView: React.FC<{ children: React.ReactNode, style?: any }> = ({ children, style }) => (
    <View style={[{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 20 }, style]}>{children}</View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
    card: { 
        borderRadius: 24, 
        borderWidth: 1,
        padding: 24,
        flex: 1,
        maxHeight: '90%',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
            android: { elevation: 4 },
            web: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }
        })
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backButton: {
        padding: 4,
    },
    indicatorContainer: { 
        flexDirection: 'row', 
        gap: 6,
    },
    indicator: { 
        width: 12, 
        height: 6, 
        borderRadius: 3, 
    },
    scrollContent: { 
        flexGrow: 1,
        paddingBottom: 20,
    },
    stepContainer: { flex: 1 },
    logoContainer: { 
        alignItems: 'center', 
        marginBottom: 24,
        marginTop: 10,
    },
    brandName: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 12,
        letterSpacing: -0.5,
    },
    title: { 
        fontSize: 28, 
        fontWeight: '800', 
        marginBottom: 12, 
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: { 
        fontSize: 16, 
        lineHeight: 24,
        marginBottom: 32, 
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: { 
        padding: 16, 
        borderRadius: 12, 
        borderWidth: 1, 
        fontSize: 16,
    },
    grid: { 
        flexDirection: 'column',
        gap: 12,
    },
    gridItem: { 
        padding: 18, 
        borderRadius: 14, 
        borderWidth: 1, 
        alignItems: 'center',
    },
    gridItemText: { 
        fontSize: 16, 
        fontWeight: '600' 
    },
    tutorCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        marginBottom: 12,
    },
    tutorAvatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tutorAvatar: { fontSize: 32 },
    tutorInfo: { flex: 1 },
    tutorName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    tutorDesc: { fontSize: 13, lineHeight: 18 },
    footer: {
        marginTop: 'auto',
        paddingTop: 20,
    },
    nextButton: {
        width: '100%',
    },
    forgotPassword: {
        marginTop: 16,
        alignItems: 'center',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '500',
    }
});
