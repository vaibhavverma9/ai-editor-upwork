import { StyleSheet } from 'react-native';
const padding = 15;
const borderRadius = 25;

export const styles = StyleSheet.create({
    header: {
        paddingTop: 80,
        marginBottom: 100
    },
    primaryButton: {
        backgroundColor: "#fff",
        width: 200,
        alignSelf: 'center',
        padding,
        borderRadius,
        borderColor: '#000', 
        borderWidth: 2
    },
    primaryButtonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#000'
    },
    video: {
        width: '100%',
        height: 200,
        marginTop: 16,
    },
    thumbnail: {
        marginHorizontal: 10,
        borderRadius: 15,
        marginBottom: 16,
    },
    textInput: {
        marginHorizontal: 10,
        height: 60,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        fontSize: 16,
        color: "#000"
    },
    button: {
        marginTop: 25, 
        backgroundColor: '#06BCEE', 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderRadius: 25,
        shadowColor: '#000', // iOS
        shadowOffset: { width: 0, height: 2 }, // iOS
        shadowOpacity: 0.3, // iOS
        shadowRadius: 4, // iOS
        elevation: 5, // Android
        width: '75%',
        alignSelf: 'center'
    }
});