import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface LogoProps {
    size?: number;
    style?: any;
}

/**
 * Professional Logo component for Knowlio
 * Uses the custom-branded PNG logo provided by the user
 */
export const Logo: React.FC<LogoProps> = ({ size = 40, style }) => {
    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});
