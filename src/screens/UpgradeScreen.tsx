import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { IntegrationCard } from '@/components/IntegrationCard';
import { useTheme } from '@/lib/useTheme';
import { PlanType } from '@/lib/types';

export const UpgradeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setPlan } = useAppStore();
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user.plan === 'free' ? 'plus' : user.plan);

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic features to get started',
      features: [
        { text: 'Basic grade tracking', included: true },
        { text: '3 AI analyses per week', included: true },
        { text: '1 flashcard deck', included: true },
        { text: 'Basic study tips', included: true },
        { text: 'Quick Study mode', included: false },
        { text: 'Custom AI tutors', included: false },
        { text: 'Study method generator', included: false },
        { text: 'Parent dashboard', included: false },
        { text: 'Voice AI tutors', included: false },
        { text: 'Platform integrations', included: false },
      ],
    },
    {
      id: 'plus' as PlanType,
      name: 'Plus',
      price: '$7',
      period: '/month',
      popular: true,
      description: 'Everything you need to excel',
      features: [
        { text: 'Unlimited grade tracking', included: true },
        { text: '25 AI analyses per week', included: true },
        { text: 'Unlimited flashcard decks', included: true },
        { text: 'Quick Study mode', included: true },
        { text: 'All AI tutors', included: true },
        { text: 'Study method generator', included: true },
        { text: 'Basic parent view', included: true },
        { text: 'AI flashcard generator', included: true },
        { text: 'Voice AI tutors', included: false },
        { text: 'Platform integrations', included: false },
      ],
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'Maximum power for serious students',
      features: [
        { text: 'Everything in Plus', included: true },
        { text: 'Unlimited AI analyses', included: true },
        { text: 'Voice AI tutors 🌟', included: true },
        { text: 'Advanced grade projections', included: true },
        { text: 'Full parent dashboard', included: true },
        { text: 'TeachAssist integration', included: true },
        { text: 'Google Classroom sync', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early access to features', included: true },
        { text: 'Custom study schedules', included: true },
      ],
    },
  ];

  const handleSelectPlan = (plan: PlanType) => {
    setPlan(plan);
    navigation.goBack();
  };

  const handleConnect = (platformName: string) => {
    if (user.plan !== 'pro') {
      Alert.alert(
        `Connect ${platformName}`,
        `${platformName} integration is available on the Pro plan. Upgrade to sync your grades automatically.`,
        [
          { text: 'Upgrade to Pro', onPress: () => navigation.navigate('Upgrade') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        `Connect ${platformName}`,
        `${platformName} integration is coming soon! You'll be notified when it's ready.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Choose Your Plan</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={[styles.tagline, { color: theme.text }]}>Turn Your 70s Into 90s 🚀</Text>

        {/* Plans */}
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <Card style={[
              styles.planCard,
              selectedPlan === plan.id && [styles.planCardSelected, { borderColor: theme.primary }],
              plan.popular && [styles.planCardPopular, { borderColor: theme.primary }],
            ]}>
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                  <Text style={[styles.planDescription, { color: theme.textSecondary }]}>{plan.description}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, { color: theme.text }]}>{plan.price}</Text>
                  <Text style={[styles.period, { color: theme.textMuted }]}>{plan.period}</Text>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name={feature.included ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={feature.included ? theme.success : theme.textMuted}
                    />
                    <Text style={[
                      styles.featureText,
                      { color: theme.textSecondary },
                      !feature.included && [styles.featureTextDisabled, { color: theme.textMuted }],
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {user.plan === plan.id && (
                <View style={[styles.currentBadge, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="checkmark" size={14} color={theme.success} />
                  <Text style={[styles.currentText, { color: theme.success }]}>Current Plan</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}

        {/* Integrations Preview */}
        <View style={styles.integrationsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Platform Integrations</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Connect your school platforms (Pro only)</Text>

          <IntegrationCard
            name="TeachAssist"
            description="Auto-import grades from YRDSB"
            icon="🏢"
            color="#3B82F6"
            connected={false}
            onConnect={() => handleConnect('TeachAssist')}
          />
          <IntegrationCard
            name="Google Classroom"
            description="Sync assignments and due dates"
            icon="📚"
            color="#10B981"
            connected={false}
            onConnect={() => handleConnect('Google Classroom')}
          />
          <IntegrationCard
            name="D2L Brightspace"
            description="Connect your school LMS"
            icon="💡"
            color="#F59E0B"
            connected={false}
            onConnect={() => handleConnect('D2L Brightspace')}
          />
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <Button
            title={user.plan === selectedPlan ? 'Current Plan' : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            onPress={() => handleSelectPlan(selectedPlan)}
            disabled={user.plan === selectedPlan}
            size="large"
            style={styles.ctaButton}
          />
          <Text style={[styles.guarantee, { color: theme.textMuted }]}>7-day free trial • Cancel anytime • No credit card required</Text>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>

          <Card style={styles.faqCard}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>Can I cancel anytime?</Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period.
            </Text>
          </Card>

          <Card style={styles.faqCard}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>Is there a free trial?</Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Yes, all paid plans come with a 7-day free trial. No credit card required to start.
            </Text>
          </Card>

          <Card style={styles.faqCard}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>What are Voice AI Tutors?</Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Voice AI Tutors let you have spoken conversations with your AI tutor, just like talking to a real person. Perfect for auditory learners!
            </Text>
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  tagline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 16,
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  period: {
    fontSize: 14,
    color: '#6B7280',
  },
  featuresContainer: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  featureTextDisabled: {
    color: '#9CA3AF',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  integrationsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  ctaButton: {
    width: '100%',
  },
  guarantee: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
  },
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  faqCard: {
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
