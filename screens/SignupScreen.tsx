import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants';

async function registerUser({ username, email, password }) {
    try {
        console.log('Attempting to register user:', { email });
        // Try different IP addresses for different scenarios
        const urls = [
            'http://10.228.195.3:8000/api/accounts/register/', 
            'http://10.190.224.208:8000/api/accounts/register/',
            'http://192.168.192.2:8000/api/accounts/register/',
            'http://10.0.2.2:8000/api/accounts/register/',
            'http://localhost:8000/api/accounts/register/',
        ];
        let lastError = null;
        for (const url of urls) {
            try {
                console.log('Trying URL:', url);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                    }),
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Registration successful:', data);
                    return { success: true, data };
                } else {
                    const errorData = await response.json();
                    console.log('Registration failed:', errorData);
                    return { success: false, error: errorData };
                }
            } catch (fetchError) {
                console.log('Fetch error for URL', url, ':', fetchError.message);
                lastError = fetchError;
                continue; // Try next URL
            }
        }
        // If all URLs failed
        return { success: false, error: `Network error: ${lastError?.message || 'All endpoints failed'}` };
    } catch (error) {
        console.log('Registration error:', error);
        return { success: false, error: error.message };
    }
}

const SignupScreen = () => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptPolicy: false
    });
    const [isNextDisabled, setIsNextDisabled] = useState(false);

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNextStep = () => {
        if (isNextDisabled) return;
        setIsNextDisabled(true);
        if (currentStep === 1 && !formData.username.trim()) {
            Alert.alert('Error', 'Please enter your username');
            setIsNextDisabled(false);
            return;
        }
        if (currentStep === 1 && !formData.email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            setIsNextDisabled(false);
            return;
        }
        if (currentStep === 2 && !formData.password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            setIsNextDisabled(false);
            return;
        }
        if (currentStep === 2 && formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            setIsNextDisabled(false);
            return;
        }
        if (currentStep === 3 && !formData.acceptPolicy) {
            Alert.alert('Error', 'Please accept the terms and conditions');
            setIsNextDisabled(false);
            return;
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
        setIsNextDisabled(false);
    };

    const handleSubmit = async () => {
        if (currentStep === 3) {
            const result = await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            if (result.success) {
                Alert.alert('OTP sent!', 'Please check your email and enter the OTP to complete registration.');
                navigation.navigate('OtpConfirmation', { email: formData.email });
            } else {
                Alert.alert('Error', JSON.stringify(result.error));
            }
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1 of 3</Text>
            <Text style={styles.stepSubtitle}>Enter your username and email</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={formData.username}
                onChangeText={(text) => updateFormData('username', text)}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email (for confirmation only)"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.singleButtonContainer}>
                <TouchableOpacity
                    style={[styles.nextButton, { opacity: isNextDisabled ? 0.5 : 1 }]}
                    onPress={handleNextStep}
                    disabled={isNextDisabled}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2 of 3</Text>
            <Text style={styles.stepSubtitle}>Create your password</Text>
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(1)}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3 of 3</Text>
            <Text style={styles.stepSubtitle}>Review and submit</Text>
            <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => updateFormData('acceptPolicy', !formData.acceptPolicy)}
            >
                <View style={[styles.checkbox, formData.acceptPolicy && styles.checkboxChecked]}>
                    {formData.acceptPolicy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>I accept the terms and conditions</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(2)}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
                    <Text style={styles.nextButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            default: return renderStep1();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Sign Up</Text>
                        <View style={{ width: 50 }} />
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{currentStep}/4</Text>
                    </View>

                    {/* Step Content */}
                    {renderCurrentStep()}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    progressContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#eee',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 15,
    },
    singleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    reviewContainer: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    reviewText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#eee',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    resendButton: {
        alignItems: 'center',
        marginBottom: 30,
    },
    resendText: {
        color: COLORS.primary,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default SignupScreen; 