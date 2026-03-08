import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore, useAppStore } from './lib/store';
import { useTheme } from './lib/useTheme';
import { Logo } from './components/Logo';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { GradesScreen } from './screens/GradesScreen';
import { AnalyzeScreen } from './screens/AnalyzeScreen';
import { StudyPlanScreen } from './screens/StudyPlanScreen';
import { ChatScreen } from './screens/ChatScreen';
import { FlashcardsScreen } from './screens/FlashcardsScreen';
import { UpgradeScreen } from './screens/UpgradeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analyze"
        component={AnalyzeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StudyPlan"
        component={StudyPlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Ranks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        {/* Fallback to text if Logo fails or fonts aren't ready */}
        <Text style={[styles.logoText, { fontSize: 48, color: theme.text }]}>K</Text>
        <Text style={[styles.logoText, { color: theme.text }]}>Knowlio</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Turn Your 70s Into 90s</Text>
      </View>
      <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
    </View>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { isDarkMode } = useAppStore();
  const theme = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialIcons.font,
  });

  // Fallback: If fonts take more than 3 seconds on web, just proceed
  const [showAppAnyway, setShowAppAnyway] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowAppAnyway(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // If fonts take too long or fail, we still want to render the app on web
  if (!fontsLoaded && !fontError && !showAppAnyway) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {!isLoggedIn ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="Chat"
                  component={ChatScreen}
                  options={{
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name="Flashcards"
                  component={FlashcardsScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="Upgrade"
                  component={UpgradeScreen}
                  options={{
                    animation: 'slide_from_bottom',
                  }}
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  customLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});
