// HomeScreen.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Home = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Home!</Text>
            <Text>You have successfully logged in.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default Home;