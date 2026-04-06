import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DefaultKit, RootStackParamList } from "../../types";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Button, Modal, Portal, Text } from 'react-native-paper';
import { Colors, commonStyles, componentStyles, Spacing } from '../../styles';
import { TouchableOpacity, View, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteDefaultKit, fetchAllDefaultKits } from '../../services/defaultKitService';

type DefaultKitsNav = NativeStackNavigationProp<RootStackParamList, 'DefaultKits'>;

const DefaultKitsAdminScreen: React.FC = () => {
    const navigation = useNavigation<DefaultKitsNav>();
    const { user } = useAuth();
    const token = (user as any)?.token || ''; 
    
    const [defaultKits, setDefaultKits] = useState<DefaultKit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);

    const showErrorModal = (message: string) => {
        setError(message);
        setErrorModalVisible(true);
    };
    
    useFocusEffect(
        useCallback(() => {
            loadDefaultKits();
        }, [token])
    );

    const loadDefaultKits = async () => {
        if (!token) return setIsLoading(false);
        setIsLoading(true);
        try {
            const data = await fetchAllDefaultKits(token);
            setDefaultKits(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            showErrorModal(`No se pudieron cargar: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDefaultKit = (defaultKit: DefaultKit) => {
        navigation.navigate('DefaultKitForm', { defaultKit, mode: 'view' });
    };

    const handleCreateDefaultKit = () => {
        navigation.navigate('DefaultKitForm', { defaultKit: undefined, mode: 'create' });
    };

    const handleEditDefaultKit = (defaultKit: DefaultKit) => {
        navigation.navigate('DefaultKitForm', { defaultKit, mode: 'edit' });
    };

    const handleDeleteDefaultKit = (kitId: number, kitName: string) => {
        const performDelete = async () => {
            try {
                await deleteDefaultKit(kitId, token);
                setDefaultKits(prev => prev.filter(k => k.id !== kitId));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                showErrorModal(`No se pudo eliminar: ${errorMessage}`);
            }
        };

        if (Platform.OS === 'web') {
            const confirmDelete = window.confirm(`¿Deseas eliminar el kit predeterminado "${kitName}"?`);
            if (confirmDelete) performDelete();
        } else {
            Alert.alert(
                'Eliminar Kit Predeterminado',
                `¿Deseas eliminar el kit "${kitName}"?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    };

    const renderDefaultKit = ({ item }: { item: DefaultKit }) => (
        <TouchableOpacity 
            style={[commonStyles.card, { flexDirection: 'row', justifyContent: 'space-between' }]} 
            activeOpacity={0.7}
            onPress={() => handleViewDefaultKit(item)} 
        >
            <View style={styles.cardLeft}>
                <View>
                    <Text style={commonStyles.title} numberOfLines={1}>{item.name}</Text>
                    {/* MEJORA 3: Limitar líneas de la descripción */}
                    <Text style={commonStyles.bodySecondary} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
            </View>

            <View style={styles.cardRight}>
                {/* MEJORA 2: Formateo de precio */}
                <Text style={[commonStyles.caption, { color: Colors.primary, fontWeight: 'bold' }]}>
                    {item.basePrice ? `${item.basePrice.toFixed(2)}€` : '0.00€'}
                </Text>

                <View style={[commonStyles.errorContainer, { marginTop: Spacing.xs }]}>
                    <TouchableOpacity 
                        style={componentStyles.iconButton} 
                        onPress={() => handleEditDefaultKit(item)} 
                    >
                        <Ionicons name="pencil" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={componentStyles.iconButton} 
                        onPress={() => handleDeleteDefaultKit(item.id, item.name)}
                    >
                        <Ionicons name="trash" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={commonStyles.containerWhite}>

            <View style={commonStyles.header}>
                <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>Gestión de kits predeterminados</Text>
                <View style={{ width: 40 }} />
            </View>
            
            <View style={[commonStyles.screenPadding, commonStyles.marginTopLg, { flex: 1 }]}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }}/>
                ) : defaultKits.length === 0 ? (
                    /* MEJORA 3: Estado vacío */
                    <Text style={[commonStyles.bodySecondary, { textAlign: 'center', marginTop: 40 }]}>
                        Aún no hay kits predeterminados creados.
                    </Text>
                ) : (
                    <FlatList
                        data={defaultKits}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderDefaultKit}
                        contentContainerStyle={[commonStyles.container, { paddingBottom: 80 }]} // padding para el FAB
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <Portal>
                <Modal
                    visible={errorModalVisible}
                    onDismiss={() => setErrorModalVisible(false)}
                    contentContainerStyle={commonStyles.errorContainer}
                >
                    <Text variant="titleMedium" style={commonStyles.subtitle}>
                        Error
                    </Text>
                    <Text style={commonStyles.errorText}>{error ?? "Ha ocurrido un error."}</Text>
                    <Button
                        mode="contained"
                        onPress={() => setErrorModalVisible(false)}
                        style={commonStyles.primaryButton}
                        buttonColor="#1A3A52"
                        textColor="#FFFFFF"
                    >
                        Entendido
                    </Button>
                </Modal>
            </Portal>

            <TouchableOpacity style={styles.fab} onPress={handleCreateDefaultKit} activeOpacity={0.85}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default DefaultKitsAdminScreen;

const styles = StyleSheet.create({
    cardLeft: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1,
        paddingRight: Spacing.sm
    },
    cardRight: { 
        alignItems: 'flex-end', 
        justifyContent: 'center', 
    },
    fab: { 
        position: 'absolute', 
        bottom: 28, 
        right: 24, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: Colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 6, 
        elevation: 8 
    },
});