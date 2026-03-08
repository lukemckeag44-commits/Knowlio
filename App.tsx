import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore, useAppStore } from './src/lib/store';
import { useTheme } from './src/lib/useTheme';
import { Logo } from './src/components/Logo';

// Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { GradesScreen } from './src/screens/GradesScreen';
import { AnalyzeScreen } from './src/screens/AnalyzeScreen';
import { StudyPlanScreen } from './src/screens/StudyPlanScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { FlashcardsScreen } from './src/screens/FlashcardsScreen';
import { UpgradeScreen } from './src/screens/UpgradeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

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
          paddingTop: 10,
          paddingBottom: 10,
          height: 75,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
            android: { elevation: 8 },
            web: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } }
          }),
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "school" : "school-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analyze"
        component={AnalyzeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "analytics" : "analytics-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StudyPlan"
        component={StudyPlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Ranks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
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
        <Logo size={120} />
        <Text style={[styles.logoText, { color: theme.text }]}>Knowlio</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Elevate Your Academic Potential</Text>
      </View>
      <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
    </View>
  );
}

export default function App() {
  const { isLoggedIn, hasOnboarded } = useAuthStore((state) => ({ 
    isLoggedIn: state.isLoggedIn, 
    hasOnboarded: state.hasOnboarded 
  }));
  const { darkMode } = useAppStore();
  const theme = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialIcons.font,
  });

  const [showAppAnyway, setShowAppAnyway] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowAppAnyway(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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
            ) : !hasOnboarded ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
          <StatusBar style={darkMode ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 20,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.7,
  },
  loader: {
    marginTop: 48,
  },
});
