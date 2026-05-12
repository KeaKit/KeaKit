import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_ROUTES } from '../../config/api';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useNotification } from '../../components/NotificationContext';
import { Helmet } from 'react-helmet-async'; 

const EditPolicyScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');

    useEffect(() => {
        loadCurrentPolicy();
    }, []);

    const loadCurrentPolicy = async () => {
        if (!user?.token) return;
        
        try {
            const response = await fetch(API_ROUTES.ADMIN_CURRENT_POLICY, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            setCurrentVersion(data.version);
            setNewVersion(incrementVersion(data.version));
            setContent(data.content);
            setOriginalContent(data.content);
        } catch (error) {
            console.error('Error loading policy:', error);
            showNotification('No se pudo cargar la política actual', 'error');
        } finally {
            setLoading(false);
        }
    };

    const incrementVersion = (version: string): string => {
        const parts = version.split('.');
        const major = parseInt(parts[0]);
        const minor = parseInt(parts[1]) + 1;
        return `${major}.${minor}`;
    };

    const handleSave = async () => {
        if (!user?.token) return;
        
        if (!content.trim()) {
            showNotification('El contenido no puede estar vacío', 'error');
            return;
        }
        
        if (content === originalContent) {
            showNotification('No hay cambios para guardar', 'info');
            return;
        }
        
        setSaving(true);
        
        try {
            const response = await fetch(API_ROUTES.ADMIN_CREATE_POLICY, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: newVersion,
                    content: content,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }
            
            showNotification(
                `¡Política actualizada! Nueva versión ${newVersion} publicada.`,
                'success'
            );
            navigation.navigate('Home' as never);
            
        } catch (error) {
            console.error('Error saving policy:', error);
            showNotification('No se pudo guardar la nueva política', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={commonStyles.container}>
                <View style={commonStyles.centerContent}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Cargando política...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <Helmet>
                <title>Editar Política de Privacidad | KeaKit</title>
                <meta name="description" content="Edición y gestión de versiones de la política de privacidad de KeaKit." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Header con botón de vuelta */}
            <View style={commonStyles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Política de Privacidad</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Versiones */}
                <View style={styles.versionCard}>
                    <View style={styles.versionRow}>
                        <Text style={styles.versionLabel}>Versión actual:</Text>
                        <Text style={styles.versionCurrent}>{currentVersion}</Text>
                    </View>
                    <View style={styles.versionRow}>
                        <Text style={styles.versionLabel}>Nueva versión:</Text>
                        <Text style={styles.versionNext}>{newVersion}</Text>
                    </View>
                    <View style={styles.warningBox}>
                        <Ionicons name="warning-outline" size={20} color={Colors.warning} />
                        <Text style={styles.warningText}>
                            Al guardar, TODOS los usuarios deberán volver a aceptar la política
                        </Text>
                    </View>
                </View>

                {/* Editor de contenido */}
                <Text style={styles.label}>Contenido de la política</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    placeholder="Escribe el contenido de la política de privacidad..."
                    placeholderTextColor={Colors.textLight}
                    textAlignVertical="top"
                />

                {/* Botón guardar */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            Publicar nueva versión ({newVersion})
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    versionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    versionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    versionLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    versionCurrent: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    versionNext: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.success,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning + '15',
        padding: Spacing.md,
        borderRadius: 8,
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: Colors.warning,
        fontWeight: '500',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    textArea: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: 14,
        color: Colors.textPrimary,
        minHeight: 400,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default EditPolicyScreen;