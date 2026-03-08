import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { z } from 'zod';
import { useAuthStore, useAppStore } from '../lib/store';
import { PlanType } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { aiTutors } from '../lib/mockData';
import { useTheme } from '../lib/useTheme';
import { Logo } from '../components/Logo';

const emailSchema = z.string().email("Please enter a valid email address");

export default function LoginScreen() {
    const [step, setStep] = useState(1);

    // Step 1: Account
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Step 2: Personal
    const [name, setName] = useState('');

    // Step 3: Grade
    const [grade, setGrade] = useState<number>(10);

    // Step 4: Tutor
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
            // Check domain for default student plan assignment (optional logic)
            const isStudent = email.toLowerCase().endsWith('.edu') || email.includes('.cas');

            // 1. Update Personalization Data in App Store
            updateUser({
                name: name.trim(),
                email: email.trim(),
                grade: grade,
                selectedTutor: selectedTutor,
            });

            // 2. Trigger Auth Login (this changes the isLoggedIn state)
            await setLogin(email);

        } catch (error) {
            Alert.alert("Login Error", "Failed to complete setup.");
        }
    };

    const renderStepIndicators = () => (
        <View style={styles.indicatorContainer}>
            {[1, 2, 3, 4].map(i => (
                <View key={i} style={[styles.indicator, { backgroundColor: theme.border }, step >= i && [styles.indicatorActive, { backgroundColor: theme.primary }]]} />
            ))}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={theme.textMuted} />
                    </TouchableOpacity>
                )}

                {renderStepIndicators()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    {step === 1 && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                            <View style={styles.logoContainer}>
                                <Logo size={120} />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>Welcome to Knowlio</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in or create an account</Text>

                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor={theme.textMuted}
                            />

                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor={theme.textMuted}
                            />
                        </Animated.View>
                    )}

                    {step === 2 && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                            <Text style={[styles.title, { color: theme.text }]}>Nice to meet you!</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>What should your AI tutor call you?</Text>

                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="First Name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                placeholderTextColor={theme.textMuted}
                            />
                        </Animated.View>
                    )}

                    {step === 3 && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                            <Text style={[styles.title, { color: theme.text }]}>What grade are you in?</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>We'll tailor your study plans accordingly.</Text>

                            <View style={styles.grid}>
                                {[9, 10, 11, 12].map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.gridItem,
                                            { borderColor: theme.border, backgroundColor: theme.background },
                                            grade === g && [styles.gridItemActive, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }]
                                        ]}
                                        onPress={() => setGrade(g)}
                                    >
                                        <Text style={[styles.gridItemText, { color: theme.textSecondary }, grade === g && [styles.gridItemTextActive, { color: theme.primary }]]}>
                                            Grade {g}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.gridItem,
                                        { borderColor: theme.border, backgroundColor: theme.background },
                                        grade === 13 && [styles.gridItemActive, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }]
                                    ]}
                                    onPress={() => setGrade(13)}
                                >
                                    <Text style={[styles.gridItemText, { color: theme.textSecondary }, grade === 13 && [styles.gridItemTextActive, { color: theme.primary }]]}>
                                        College
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {step === 4 && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                            <Text style={styles.title}>Choose your AI Tutor</Text>
                            <Text style={styles.subtitle}>Who matches your learning style best?</Text>

                            {aiTutors.map((tutor) => (
                                <TouchableOpacity
                                    key={tutor.id}
                                    style={[
                                        styles.tutorCard,
                                        { borderColor: theme.border, backgroundColor: theme.background },
                                        selectedTutor === tutor.id && [styles.tutorCardActive, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }]
                                    ]}
                                    onPress={() => setSelectedTutorId(tutor.id)}
                                >
                                    <Text style={styles.tutorAvatar}>{tutor.avatar}</Text>
                                    <View style={styles.tutorInfo}>
                                        <Text style={[styles.tutorName, { color: theme.text }, selectedTutor === tutor.id && [styles.tutorNameActive, { color: theme.primary }]]}>{tutor.name}</Text>
                                        <Text style={[styles.tutorDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                                            {tutor.personality}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    )}
                </ScrollView>

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={handleNext}>
                    <Text style={styles.buttonText}>{step === 4 ? "Let's Begin" : "Continue"}</Text>
                </TouchableOpacity>

                {step === 1 && (
                    <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Password reset is not yet available.")}>
                        <Text style={[styles.linkText, { color: theme.primary }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'white', padding: 30, borderRadius: 24, paddingVertical: 40, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 8, flex: 1, maxHeight: '85%' },
    backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
    indicatorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 8, marginTop: 10 },
    indicator: { width: 40, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
    indicatorActive: { backgroundColor: '#3B82F6' },
    stepContainer: { flex: 1 },
    logoContainer: { alignItems: 'center', marginBottom: 20 },
    customLogo: { width: 100, height: 100, resizeMode: 'contain' },
    title: { fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 30, textAlign: 'center' },
    input: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, color: '#1F2937' },
    button: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 12, marginTop: 20, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
    linkText: { color: '#3B82F6', textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '500' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    gridItem: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
    gridItemActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
    gridItemText: { fontSize: 16, color: '#4B5563', fontWeight: '600' },
    gridItemTextActive: { color: '#3B82F6' },
    tutorCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, backgroundColor: '#F9FAFB' },
    tutorCardActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
    tutorAvatar: { fontSize: 36, marginRight: 16 },
    tutorInfo: { flex: 1 },
    tutorName: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    tutorNameActive: { color: '#1D4ED8' },
    tutorDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});