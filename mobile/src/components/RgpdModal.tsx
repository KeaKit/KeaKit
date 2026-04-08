// components/RgpdModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles';
import { checkRgpdConsent, acceptRgpd, RGPD_VERSION } from '../services/rgpdService';
import { useAuth } from '../context/AuthContext';
import RgpdPolicyScreen from '../screens/legal/RgpdPolicyScreen';

export const RgpdModal: React.FC = () => {
    const { user } = useAuth();

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    // 🔥 Modal de política completa
    const [showFullPolicy, setShowFullPolicy] = useState(false);

    useEffect(() => {
        const checkConsent = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }

            try {
                const hasAccepted = await checkRgpdConsent(user.token);
                setVisible(!hasAccepted);
            } catch (error) {
                console.error('Error checking RGPD:', error);
                setVisible(true);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(checkConsent, 300);
        return () => clearTimeout(timer);
    }, [user]);

    const handleAccept = async () => {
        if (!user?.token) return;

        try {
            setAccepting(true);
            await acceptRgpd(user.token, RGPD_VERSION);
            setVisible(false);
        } catch (error) {
            console.error('Error accepting RGPD:', error);
        } finally {
            setAccepting(false);
        }
    };

    const handleOpenPolicy = () => {
        setShowFullPolicy(true); // 🔥 Abrir política encima del modal
    };

    if (loading) return null;

    return (
        <>
            {/* 🔥 MODAL PRINCIPAL RGPD */}
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
                        <Text style={styles.title}>Política de Privacidad</Text>
                        <Text style={styles.subtitle}>KeaKit</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.introText}>
                            Para continuar usando KeaKit, debes aceptar nuestra política de privacidad.
                        </Text>

                        <Text style={styles.sectionTitle}>¿Qué datos recogemos?</Text>
                        <Text style={styles.text}>
                            • Nombre, email, teléfono, dirección, ciudad y país{'\n'}
                            • Datos de tus artículos, servicios y kits{'\n'}
                            • Historial de transacciones y valoraciones
                        </Text>

                        <Text style={styles.sectionTitle}>¿Cómo usamos tus datos?</Text>
                        <Text style={styles.text}>
                            • Para gestionar tus alquileres y pagos{'\n'}
                            • Para comunicarnos sobre tus pedidos{'\n'}
                            • Para mejorar nuestros servicios
                        </Text>

                        <Text style={styles.sectionTitle}>Tus derechos RGPD</Text>
                        <Text style={styles.text}>
                            Puedes acceder, o rectificar tus datos desde el menú de perfil.
                        </Text>

                        <TouchableOpacity
                            style={styles.fullPolicyButton}
                            onPress={handleOpenPolicy}
                        >
                            <Text style={styles.fullPolicyButtonText}>Leer política completa →</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, accepting && styles.buttonDisabled]}
                            onPress={handleAccept}
                            disabled={accepting}
                        >
                            {accepting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Acepto la política de privacidad</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showFullPolicy}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <RgpdPolicyScreen onClose={() => setShowFullPolicy(false)} />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.primary + '10',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    introText: {
        fontSize: 15,
        color: '#444',
        marginBottom: 20,
        lineHeight: 22,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    fullPolicyButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 16,
    },
    fullPolicyButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
