import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { API_ROUTES } from '../../../config/api';
import { Colors } from '../../../styles';
import { defaultKitStyles } from "../../../styles/defaultKitStyles";

import { PresetProductSelectionModal, PresetCatalogProduct } from "../../../components/PresetProductSelectionModal"; 
import { KitCreateRequest, KitStatus } from "../../../types"; 

const EditDefaultKitScreen = () => {
    const { user } = useAuth();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { kitId } = route.params;

    const [kitBase, setKitBase] = useState<any>(null);
    const [currentItems, setCurrentItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [catalog, setCatalog] = useState<PresetCatalogProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
    const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.token || !kitId || isNaN(kitId)) {
                setLoading(false);
                return;
            }

            try {
                const kitRes = await fetch(API_ROUTES.DEFAULT_KIT_BY_ID(kitId), {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                if (!kitRes.ok) throw new Error(`Error ${kitRes.status}`);

                const kitData = await kitRes.json();
                setKitBase(kitData);
                
                // --- MAPEO DE SEGURIDAD CORREGIDO ---
                // En el DTO de DefaultKit del Back, los items vienen en 'kitItems'
                // En la versión antigua, venían en 'items' y cada uno tenía un objeto 'item' dentro.
                let rawItems = kitData.kitItems || kitData.items || [];
                
                const normalizedItems = rawItems.map((it: any) => {
                    // Si viene de la interfaz antigua (it.item.title)
                    if (it.item) {
                        return {
                            id: it.item.id,
                            title: it.item.title,
                            pricePerMonth: it.item.pricePerMonth,
                            category: it.item.category || ""
                        };
                    }
                    // Si viene del DTO nuevo (kitItems con name y priceAtRental)
                    return {
                        id: it.id || it.itemId,
                        title: it.name || it.title || "Artículo sin nombre",
                        pricePerMonth: it.priceAtRental || it.pricePerMonth || 0,
                        category: it.category || ""
                    };
                });

                setCurrentItems(normalizedItems);

                const catalogRes = await fetch(API_ROUTES.ITEMS_FOR_RENT(user.id), {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                if (catalogRes.ok) {
                    const catalogData = await catalogRes.json();
                    setCatalog(catalogData);
                }

            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, [kitId, user?.token, user?.id]);

    const handleRemoveItem = (idToRemove: number) => {
        // Filtramos por cualquier ID posible para asegurar que se borre
        setCurrentItems(prev => prev.filter(item => item.id !== idToRemove && item.itemId !== idToRemove));
    };

    const handleToggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleConfirmModal = () => {
        const newItems = selectedIds
            .map(id => catalog.find(c => c.id === id))
            .filter(Boolean)
            .map((p: any) => ({
                id: p.id,
                title: p.title,
                pricePerMonth: p.pricePerMonth,
                category: p.category
            }));
            
        setCurrentItems(prev => [...prev, ...newItems]);
        setSelectedIds([]); 
        setModalVisible(false); 
    };

    const handleSaveAsMyKit = async () => {
        if (!user?.token || !user?.id || currentItems.length === 0) return;
        
        try {
            setSaving(true);
            
            // Generamos fechas por defecto para que el backend no de error 400
            // Usamos el formato YYYY-MM-DD que espera el KitCreateRequest
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const mappedSelections = currentItems.map(item => ({
                itemId: item.id || item.itemId, 
                quantity: 1, 
                pricePerMonth: item.pricePerMonth || 0, 
            }));

            // CONSTRUCCIÓN DEL PAYLOAD COMPLETO PARA EVITAR EL ERROR 400
            const payload: Partial<KitCreateRequest> = {
                name: `Mi versión de ${kitBase?.name || 'Kit'}`,
                tenantId: user.id,
                status: KitStatus.DRAFT,
                itemSelections: mappedSelections,
                // SOLUCIÓN AL ERROR: Enviamos fechas por defecto
                startDate: formatDate(today),
                endDate: formatDate(tomorrow),
                // Campos obligatorios adicionales
                country: kitBase?.country || user?.country || "España",
                city: kitBase?.city || user?.city || "Sevilla",
                deliveryMethod: "MEETING_POINT",
                meetingPoint: "A acordar con el propietario",
            };

            console.log("Enviando payload al backend:", JSON.stringify(payload));

            const response = await fetch(API_ROUTES.CREATE_KIT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                Alert.alert("¡Éxito!", "Tu kit personalizado ha sido guardado como borrador en tu perfil.");
                navigation.navigate("MyKits");
            } else {
                const errorData = await response.text();
                console.error("Error 400 detallado:", errorData);
                Alert.alert("Error", "No se pudo crear el kit. Revisa los datos obligatorios.");
            }
        } catch (error) {
            console.error("Error en la petición POST:", error);
            Alert.alert("Error", "Ocurrió un error de red al intentar guardar el kit.");
        } finally {
            setSaving(false);
        }
    };

    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        catalog.forEach((p) => { if (p.category) set.add(p.category); });
        return ["ALL", ...Array.from(set)];
    }, [catalog]);

    const filteredCatalog = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const currentItemIds = new Set(currentItems.map(i => i.id || i.itemId));

        return catalog.filter((product) => {
            if (currentItemIds.has(product.id)) return false;
            if (showOnlyMyCity && user?.city && product.city !== user.city) return false;
            if (categoryFilter !== "ALL" && product.category !== categoryFilter) return false;
            if (query) {
                const text = `${product.title} ${product.category ?? ""}`.toLowerCase();
                return text.includes(query);
            }
            return true;
        });
    }, [catalog, categoryFilter, currentItems, searchText, showOnlyMyCity, user?.city]);

    if (loading) return <ActivityIndicator size="large" color={Colors.primaryHome} style={{flex: 1}}/>;

    return (
        <SafeAreaView style={defaultKitStyles.screen}>
            <View style={defaultKitStyles.header}>
                <TouchableOpacity style={defaultKitStyles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primaryHome} />
                </TouchableOpacity>
                <Text style={defaultKitStyles.headerTitle}>Personalizar Kit</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={defaultKitStyles.listContent}>
                <Text style={defaultKitStyles.cardTitle}>{kitBase?.name}</Text>
                <Text style={[defaultKitStyles.helperText, { marginTop: 6, marginBottom: 20 }]}>
                    Añade o quita artículos para crear tu copia personalizada.
                </Text>

                {currentItems.map((item, idx) => (
                    <View key={`${item.id || item.itemId}-${idx}`} style={defaultKitStyles.itemRow}>
                        <View style={defaultKitStyles.itemInfo}>
                            {/* Ahora usamos 'title' que fue normalizado arriba */}
                            <Text style={defaultKitStyles.itemName}>{item.title}</Text>
                            <Text style={defaultKitStyles.itemMeta}>
                                {item.category} · {Number(item.pricePerMonth).toFixed(2)}€/mes
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={defaultKitStyles.removeButton} 
                            onPress={() => handleRemoveItem(item.id || item.itemId)}
                        >
                            <Ionicons name="trash-outline" size={22} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={defaultKitStyles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={defaultKitStyles.addButtonText}>+ Añadir más productos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        defaultKitStyles.confirmButton, 
                        currentItems.length === 0 && defaultKitStyles.confirmButtonDisabled
                    ]} 
                    onPress={handleSaveAsMyKit}
                    disabled={currentItems.length === 0 || saving}
                >
                    <Text style={defaultKitStyles.confirmButtonText}>
                        {saving ? "Guardando..." : "Guardar en mis Kits"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <PresetProductSelectionModal
                visible={modalVisible}
                onDismiss={() => {
                    setModalVisible(false);
                    setSelectedIds([]);
                }}
                searchText={searchText}
                onSearchChange={setSearchText}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter as any}
                categories={availableCategories}
                filteredProducts={filteredCatalog}
                selectedIds={selectedIds}
                onToggleSelection={handleToggleSelection}
                onConfirm={handleConfirmModal} 
                userCity={user?.city}
                showOnlyMyCity={showOnlyMyCity}
                onToggleMyCity={setShowOnlyMyCity}
            />
        </SafeAreaView>
    );
};

export default EditDefaultKitScreen;