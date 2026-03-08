import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { PlanType } from '@/lib/types';
import { useTheme } from '@/lib/useTheme';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanType) => void;
  currentPlan: PlanType;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  onClose,
  onSelectPlan,
  currentPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('plus');
  const theme = useTheme();

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic grade tracking',
        '3 AI analyses per week',
        '1 flashcard deck',
        'Basic study tips',
      ],
      limitations: [
        'Limited AI responses',
        'No custom tutors',
        'No advanced analytics',
        'No parent reports',
      ],
    },
    {
      id: 'plus' as PlanType,
      name: 'Plus',
      price: '$7',
      period: '/month',
      popular: true,
      features: [
        'Unlimited grade tracking',
        '25 AI analyses per week',
        'Unlimited flashcards',
        'Quick Study mode',
        'All AI tutors',
        'Study method generator',
        'Basic parent view',
      ],
      limitations: [
        'No voice AI tutors',
        'No priority support',
      ],
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro',
      price: '$12',
      period: '/month',
      features: [
        'Everything in Plus',
        'Unlimited AI analyses',
        'Voice AI tutors 🌟',
        'Advanced grade projections',
        'Full parent dashboard',
        'TeachAssist integration',
        'Google Classroom sync',
        'Priority support',
      ],
      limitations: [],
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Choose Your Plan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Turn your 70s into 90s with the right tools</Text>

          <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { borderColor: theme.border, backgroundColor: theme.background },
                  selectedPlan === plan.id && [styles.planCardSelected, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }],
                  plan.popular && [styles.planCardPopular, { borderColor: theme.primary }],
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: theme.text }]}>{plan.price}</Text>
                    <Text style={[styles.period, { color: theme.textSecondary }]}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                      <Text style={[styles.featureText, { color: theme.textSecondary }]}>{feature}</Text>
                    </View>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons name="close-circle" size={18} color={theme.danger} />
                      <Text style={[styles.limitationText, { color: theme.textMuted }]}>{limitation}</Text>
                    </View>
                  ))}
                </View>

                {currentPlan === plan.id && (
                  <View style={[styles.currentBadge, { backgroundColor: theme.border }]}>
                    <Text style={[styles.currentText, { color: theme.textSecondary }]}>Current Plan</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={currentPlan === selectedPlan ? 'Current Plan' : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
              onPress={() => {
                onSelectPlan(selectedPlan);
                onClose();
              }}
              disabled={currentPlan === selectedPlan}
              size="large"
              style={styles.upgradeButton}
            />
            <Text style={[styles.guarantee, { color: theme.textMuted }]}>7-day free trial • Cancel anytime</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  planCardPopular: {
    borderColor: '#3B82F6',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  period: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 2,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  limitationText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  currentBadge: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  upgradeButton: {
    width: '100%',
  },
  guarantee: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
