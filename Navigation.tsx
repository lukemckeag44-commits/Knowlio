import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../lib/store';

export default function MainScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAppStore();

    const handleStartStudy = () => {
        if (user.plan !== 'free') {
            navigation.navigate('StudySession');
        } else {
            Alert.alert("Upgrade Required", "Upgrade to Plus or Pro for unlimited study sessions!");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Hub</Text>

            {/* Main Action Button */}
            <TouchableOpacity style={styles.mainButton} onPress={handleStartStudy}>
                <Text style={styles.buttonText}>Start Daily Study Session</Text>
            </TouchableOpacity>

            <View style={styles.row}>
                {/* Google Classroom (Free Plan) */}
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('GoogleClassroom')}
                >
                    <Text style={styles.smallText}>Google Classroom</Text>
                </TouchableOpacity>

                {/* TeachAssist (Free Plan) */}
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('TeachAssist')}
                >
                    <Text style={styles.smallText}>TeachAssist</Text>
                </TouchableOpacity>
            </View>

            {/* AI Assistant Button */}
            <TouchableOpacity
                style={styles.aiButton}
                onPress={() => navigation.navigate('AIChatbot')}
            >
                <Text style={styles.buttonText}>Open AI Assistant</Text>
            </TouchableOpacity>
        </View>
    );
}

// Global "Back Home" Button Component to use in ANY screen
export const BackHomeButton = () => {
    const navigation = useNavigation<any>();
    return (
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('MainScreen')}
        >
            <Text style={styles.backButtonText}>🏠 Back to Main</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
    mainButton: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 12, marginBottom: 20 },
    aiButton: { backgroundColor: '#2196F3', padding: 20, borderRadius: 12, marginTop: 20 },
    secondaryButton: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: '#ddd' },
    buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 18 },
    smallText: { textAlign: 'center', color: '#333' },
    backButton: { position: 'absolute', top: 50, left: 20, padding: 10 },
    backButtonText: { fontSize: 16, color: '#2196F3', fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
});