// screens/legal/RgpdPolicyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../styles';
import { API_ROUTES } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async'; 

const RgpdPolicyScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [version, setVersion] = useState('');

    useEffect(() => {
        loadPolicy();
    }, []);

    const loadPolicy = async () => {
        try {
            // Intentar obtener la política actual desde el backend
            const url = user?.token 
                ? API_ROUTES.ADMIN_CURRENT_POLICY 
                : API_ROUTES.RGPD_CURRENT_POLICY;
            
            const response = await fetch(url, {
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
            });
            
            if (response.ok) {
                const data = await response.json();
                setContent(data.content);
                setVersion(data.version);
            } else {
                // Contenido por defecto si falla la API
                setContent(policyContent);
                setVersion('1.0');
            }
        } catch (error) {
            console.error('Error loading policy:', error);
            setContent(policyContent);
            setVersion('1.0');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Helmet>
                <title>Política de Privacidad | KeaKit</title>
                <meta name="description" content="Política de privacidad de KeaKit. Consulta cómo gestionamos tus datos personales." />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Política de Privacidad</Text>
                <Text style={styles.version}>Versión {version}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.text}>{content}</Text>
            </ScrollView>
        </View>
    );
};

const policyContent = `Política de Privacidad de KeaKit

1. Responsable del tratamiento
KeaKit es el responsable del tratamiento de sus datos personales.

2. Datos que recogemos
Recogemos su nombre, email, teléfono, dirección, ciudad y país.
También recogemos información sobre sus transacciones y actividad en la plataforma.

3. Finalidad del tratamiento
- Gestionar su cuenta de usuario
- Procesar alquileres de artículos, kits y servicios
- Gestionar pagos a través de wallet y Stripe
- Enviar notificaciones sobre el estado de sus alquileres
- Resolver incidencias y gestionar valoraciones
- Mejorar y personalizar nuestros servicios

4. Sus derechos
Tiene derecho a acceder, rectificar, suprimir, oponerse y limitar el tratamiento de sus datos.
Para ejercer sus derechos, contáctenos en: equipo.keakit@gmail.com`;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 16,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, flex: 1 },
    version: { fontSize: 12, color: '#666' },
    content: { padding: 20 },
    text: { fontSize: 14, lineHeight: 22, color: '#444' },
});

export default RgpdPolicyScreen;