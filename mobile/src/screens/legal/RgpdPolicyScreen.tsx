import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../styles';

interface Props {
    onClose: () => void;
}

const RgpdPolicyScreen: React.FC<Props> = ({ onClose }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Política de Privacidad</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.lastUpdate}>Última actualización: 8 de abril de 2026</Text>

                {/* 1. Responsable */}
                <Text style={styles.sectionTitle}>1. Responsable del tratamiento</Text>
                <Text style={styles.text}>
                    <Text style={styles.bold}>KeaKit</Text>{'\n'}
                    Correo electrónico: equipo.keakit@gmail.com{'\n'}
                    A efectos del RGPD, KeaKit actúa como Responsable del Tratamiento de tus datos personales.
                </Text>

                {/* 2. Datos que recogemos */}
                <Text style={styles.sectionTitle}>2. ¿Qué datos personales recogemos?</Text>
                <Text style={styles.text}>
                    • Datos identificativos: nombre, email, teléfono, dirección, país y ciudad{'\n'}
                    • Datos de cuenta: contraseña (encriptada), rol (usuario, repartidor, administrador){'\n'}
                    • Datos de actividad: artículos publicados, kits creados, servicios ofrecidos{'\n'}
                    • Datos financieros: saldo de wallet, historial de transacciones{'\n'}
                    • Valoraciones: comentarios y puntuaciones sobre usuarios y servicios{'\n'}
                    • Datos de incidencias: descripciones de problemas reportados{'\n'}
                    • Datos de seguimiento: ubicación aproximada para envíos
                </Text>

                {/* 3. Finalidad */}
                <Text style={styles.sectionTitle}>3. ¿Con qué finalidad tratamos tus datos?</Text>
                <Text style={styles.text}>
                    • Gestionar tu cuenta y autenticación{'\n'}
                    • Procesar alquileres de artículos, kits y servicios{'\n'}
                    • Gestionar pagos a través de wallet y Stripe{'\n'}
                    • Enviar notificaciones sobre el estado de tus alquileres y envíos{'\n'}
                    • Resolver incidencias y gestionar valoraciones{'\n'}
                    • Mejorar y personalizar nuestros servicios{'\n'}
                    • Cumplir con obligaciones legales (facturación, prevención de fraude)
                </Text>

                {/* 4. Base legal */}
                <Text style={styles.sectionTitle}>4. ¿Cuál es la base legal del tratamiento?</Text>
                <Text style={styles.text}>
                    • Ejecución de un contrato: gestión de alquileres y pagos{'\n'}
                    • Consentimiento: comunicaciones comerciales, cookies{'\n'}
                    • Interés legítimo: mejora del servicio, seguridad y prevención de fraude{'\n'}
                    • Obligación legal: cumplimiento fiscal y regulatorio
                </Text>

                {/* 5. Destinatarios */}
                <Text style={styles.sectionTitle}>5. ¿Compartimos tus datos con terceros?</Text>
                <Text style={styles.text}>
                    • <Text style={styles.bold}>Stripe</Text>: para procesar pagos con tarjeta{'\n'}
                    • <Text style={styles.bold}>Repartidores</Text>: información necesaria para completar envíos{'\n'}
                    • <Text style={styles.bold}>Autoridades competentes</Text>: cuando sea requerido por ley{'\n'}
                    {'\n'}No vendemos ni alquilamos tus datos personales a terceros.
                </Text>

                {/* 6. Plazos de conservación */}
                <Text style={styles.sectionTitle}>6. ¿Cuánto tiempo conservamos tus datos?</Text>
                <Text style={styles.text}>
                    • Mientras mantengas tu cuenta activa en KeaKit{'\n'}
                    • Datos financieros: 5-10 años (obligación legal){'\n'}
                    • Valoraciones: se mantienen de forma anónima tras el cierre de cuenta{'\n'}
                    • Datos de incidencias: 3 años tras su resolución{'\n'}
                    • Al cerrar tu cuenta, eliminaremos tus datos personales excepto aquellos que debamos conservar por ley
                </Text>

                {/* 7. Tus derechos */}
                <Text style={styles.sectionTitle}>7. Tus derechos RGPD</Text>
                <Text style={styles.text}>
                    Tienes derecho a:{'\n'}
                    • <Text style={styles.bold}>Acceder</Text> a tus datos personales{'\n'}
                    • <Text style={styles.bold}>Rectificar</Text> datos inexactos{'\n'}
                    • <Text style={styles.bold}>Suprimir</Text> tus datos ("derecho al olvido"){'\n'}
                    • <Text style={styles.bold}>Oponerte</Text> al tratamiento{'\n'}
                    • <Text style={styles.bold}>Limitar</Text> el tratamiento{'\n'}
                    • <Text style={styles.bold}>Portabilidad</Text> de tus datos{'\n'}
                    • <Text style={styles.bold}>Retirar el consentimiento</Text> en cualquier momento{'\n'}
                    {'\n'}Para ejercer tus derechos, contáctanos en: equipo.keakit@gmail.com
                </Text>

                {/* 8. Seguridad */}
                <Text style={styles.sectionTitle}>8. Seguridad de los datos</Text>
                <Text style={styles.text}>
                    Implementamos medidas técnicas y organizativas para proteger tus datos:{'\n'}
                    • Encriptación de contraseñas{'\n'}
                    • Comunicaciones seguras mediante HTTPS y tokens JWT{'\n'}
                    • Acceso restringido a datos personales{'\n'}
                    • Copias de seguridad encriptadas
                </Text>

                {/* 9. Cambios en la política */}
                <Text style={styles.sectionTitle}>9. Cambios en esta política</Text>
                <Text style={styles.text}>
                    Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos a través de la aplicación o por correo electrónico.
                </Text>

                {/* 10. Contacto */}
                <Text style={styles.sectionTitle}>10. Contacto</Text>
                <Text style={styles.text}>
                    Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus datos, puedes contactarnos en:{'\n'}
                    {'\n'}📧 equipo.keakit@gmail.com{'\n'}
                    {'\n'}También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
                </Text>

                <View style={styles.acceptanceBox}>
                    <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
                    <Text style={styles.acceptanceText}>
                    Al utilizar KeaKit, aceptas los términos de esta Política de Privacidad.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    lastUpdate: {
        fontSize: 12,
        color: '#888',
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    text: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    bold: {
        fontWeight: '700',
    },
    acceptanceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: Spacing.md,
        borderRadius: 12,
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    acceptanceText: {
        flex: 1,
        fontSize: 13,
        color: '#2e7d32',
    },
});

export default RgpdPolicyScreen;