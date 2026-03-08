import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { useAuthStore } from '../lib/store';
import { Card } from '../components/Card';
import { TutorSelector } from '../components/TutorSelector';
import { useTheme } from '../lib/useTheme';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, toggleParentMode, setUser, darkMode, setDarkMode } = useAppStore();
  const theme = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const [notifications, setNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Logged Out', 'You have been logged out.');
          },
        },
      ]
    );
  };

  const handleGradeLevel = () => {
    const grades = ['9', '10', '11', '12'];
    Alert.alert(
      'Select Grade Level',
      'Choose your current grade:',
      [
        ...grades.map((g) => ({
          text: `Grade ${g}`,
          onPress: () => setUser({ ...user, grade: parseInt(g) }),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleConnectedAccounts = () => {
    Alert.alert(
      'Connected Accounts',
      'Platform integrations like Google Classroom and TeachAssist are available on the Pro plan.',
      [
        { text: 'Upgrade to Pro', onPress: () => navigation.navigate('Upgrade') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleHelpCenter = () => {
    Alert.alert(
      'Help Center',
      'Visit our help center for guides, FAQs, and tutorials.',
      [
        { text: 'Open Help Center', onPress: () => Linking.openURL('https://knowlio.ai/help') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Have a question or issue? Reach out to our support team.',
      [
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@knowlio.ai') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://knowlio.ai/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://knowlio.ai/terms');
  };

  const handleSaveProfile = () => {
    if (editName.trim() && editEmail.trim()) {
      setUser({ ...user, name: editName.trim(), email: editEmail.trim() });
      setShowEditProfile(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    }
  };

  const getPlanBadgeColor = () => {
    switch (user.plan) {
      case 'pro': return '#8B5CF6';
      case 'plus': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Settings</Text>
        </View>

        {/* Profile */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{user.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user.email}</Text>
              <View style={[styles.planBadge, { backgroundColor: getPlanBadgeColor() }]}>
                <Text style={styles.planBadgeText}>{user.plan.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.editButton, { borderTopColor: theme.border }]} onPress={() => setShowEditProfile(true)}>
            <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* AI Tutor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your AI Tutor</Text>
          <TutorSelector />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>

          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="alarm" size={22} color={theme.warning} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Study Reminders</Text>
              </View>
              <Switch
                value={studyReminders}
                onValueChange={setStudyReminders}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={22} color={theme.secondary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="people" size={22} color={theme.success} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Parent Mode</Text>
              </View>
              <Switch
                value={user.isParentMode}
                onValueChange={toggleParentMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>

          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Upgrade')}>
              <View style={styles.settingInfo}>
                <Ionicons name="diamond" size={22} color={theme.warning} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Subscription</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow} onPress={handleGradeLevel}>
              <View style={styles.settingInfo}>
                <Ionicons name="school" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Grade Level</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.menuValue, { color: theme.textSecondary }]}>Grade {user.grade}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow} onPress={handleConnectedAccounts}>
              <View style={styles.settingInfo}>
                <Ionicons name="link" size={22} color={theme.secondary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Connected Accounts</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.menuValue, { color: theme.textSecondary }]}>None</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support</Text>

          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.menuRow} onPress={handleHelpCenter}>
              <View style={styles.settingInfo}>
                <Ionicons name="help-circle" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow} onPress={handleContactSupport}>
              <View style={styles.settingInfo}>
                <Ionicons name="chatbubble-ellipses" size={22} color={theme.success} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow} onPress={handlePrivacyPolicy}>
              <View style={styles.settingInfo}>
                <Ionicons name="document-text" size={22} color={theme.textMuted} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow} onPress={handleTermsOfService}>
              <View style={styles.settingInfo}>
                <Ionicons name="document" size={22} color={theme.textMuted} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.danger + '20' }]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: theme.textMuted }]}>Knowlio v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textMuted}
            />

            <TouchableOpacity
              style={[styles.saveButton, (!editName.trim() || !editEmail.trim()) && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={!editName.trim() || !editEmail.trim()}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  settingsCard: {
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#1F2937',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 50,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
