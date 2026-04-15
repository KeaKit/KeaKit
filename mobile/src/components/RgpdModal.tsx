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
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing } from '../styles';
import { checkNeedsConsent, acceptRgpd, PolicyInfo } from '../services/rgpdService';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RgpdModal: React.FC = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [policyInfo, setPolicyInfo] = useState<PolicyInfo | null>(null);

    useEffect(() => {
        const checkNeeds = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }

            try {
                const info = await checkNeedsConsent(user.token);
                setPolicyInfo(info);
                setVisible(info.needsConsent);
            } catch (error) {
                console.error('Error checking RGPD:', error);
                setVisible(true);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(checkNeeds, 300);
        return () => clearTimeout(timer);
    }, [user]);

    const handleAccept = async () => {
        if (!user?.token || !policyInfo) return;

        try {
            setAccepting(true);
            await acceptRgpd(user.token, policyInfo.currentVersion);
            setVisible(false);
        } catch (error) {
            console.error('Error accepting RGPD:', error);
        } finally {
            setAccepting(false);
        }
    };

    const openFullPolicy = () => {
        setVisible(false);
        navigation.navigate('RgpdPolicy');
    };

    if (loading) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
        >
            <View style={styles.container}>
                {/* Header compacto */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Actualización Política de Privacidad</Text>
                    <Text style={styles.subtitle}>Versión {policyInfo?.currentVersion}</Text>
                    <Text style={styles.introText}>
                        Hemos actualizado nuestra política de privacidad. Revisa los cambios, y acepta para seguir usando la app sin interrupciones.
                    </Text>
                </View>

                {/* Contenido de la política - OCUPA MÁS ESPACIO */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >

                    <View style={styles.policyContentBox}>
                        <Text style={styles.policyContentText}>
                            {policyInfo?.policyContent || "Cargando contenido..."}
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer con botón de aceptar */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, accepting && styles.buttonDisabled]}
                        onPress={handleAccept}
                        disabled={accepting}
                        activeOpacity={0.8}
                    >
                        {accepting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Aceptar nueva política</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundWhite,
    },
    header: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: Colors.primary + '08',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    introText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    policyContentBox: {
        flex: 1,
        backgroundColor: Colors.backgroundGray,
        borderRadius: 12,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: SCREEN_HEIGHT * 0.45,
    },
    policyContentText: {
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.backgroundWhite,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    buttonIcon: {
        marginRight: Spacing.xs,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.textWhite,
        fontSize: 16,
        fontWeight: '600',
    },
    fullPolicyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    fullPolicyButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});