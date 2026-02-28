import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { createKit } from '../../services/kitService';
import BASE_URL from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors, commonStyles, componentStyles } from '../../styles';
import { createKitStyles } from '../../styles/createKitStyles';
import KitItemComponent from '../../components/KitItemComponent';

const GUARANTEE_PERCENTAGE = 0.20; // 20% de garantía sobre el precio total del kit

type CreateKitNav = NativeStackNavigationProp<RootStackParamList, 'CreateKit'>;

type FormErrors = {
  name?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  items?: string;
  general?: string;
};

type CatalogProduct = {
  id: number;
  title: string;
  pricePerMonth: number;
  status: string;
  city?: string;
  ownerName?: string;
  imageUrl?: string | null;
};

const toIsoDate = (raw: string): string | null => {
  const value = raw.trim();
  const slashFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const isoFormat = /^(\d{4})-(\d{2})-(\d{2})$/;

  let year = 0;
  let month = 0;
  let day = 0;

  const slash = value.match(slashFormat);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    year = Number(slash[3]);

    const dmyValid = a >= 1 && a <= 31 && b >= 1 && b <= 12;
    const mdyValid = a >= 1 && a <= 12 && b >= 1 && b <= 31;

    if (dmyValid) {
      day = a;
      month = b;
    } else if (mdyValid) {
      month = a;
      day = b;
    } else {
      return null;
    }
  } else {
    const iso = value.match(isoFormat);
    if (!iso) return null;
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const valid =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!valid) return null;

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

function calculateMonthsBetween(start: Date, end: Date): number {
  // Función para calcular la duración exacta en meses del alquiler del kit
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  const days = end.getUTCDate() - start.getUTCDate();
  
  let totalMonths = years * 12 + months;
  
  const daysInMonth = 30;
  const monthFraction = days / daysInMonth;
  
  return totalMonths + monthFraction;
}

const toUtcDateOnly = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

const CreateKitScreen: React.FC = () => {
  const navigation = useNavigation<CreateKitNav>();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [availableProducts, setAvailableProducts] = useState<CatalogProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});


  const monthsBetween = useMemo(() => {
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);
    
    if (!startIso || !endIso) return null;
    
    const start = toUtcDateOnly(startIso);
    const end = toUtcDateOnly(endIso);
    
    return calculateMonthsBetween(start, end);
  }, [startDate, endDate]);


  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const loadCatalog = useCallback(async () => {
    if (!user?.token) {
      setAvailableProducts([]);
      setLoadingCatalog(false);
      setErrors((prev) => ({ ...prev, general: 'Necesitas iniciar sesión.' }));
      return;
    }

    try {
      setLoadingCatalog(true);

      const res = await fetch(`${BASE_URL}/api/article/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      const raw = await res.json();

      const mapped: CatalogProduct[] = (raw ?? [])
        .map((p: any) => ({
          id: Number(p.id),
          title: p.title ?? 'Sin título',
          pricePerMonth: Number(p.pricePerMonth ?? 0),
          status: String(p.status ?? 'AVAILABLE'),
          city: p.city ?? '',
          ownerName: p.owner?.name ?? '',
          imageUrl: p.imageUrl ?? null,
        }))
        .filter((p: CatalogProduct) => p.status === 'AVAILABLE');

      setAvailableProducts(mapped);
      setErrors((prev) => ({ ...prev, general: undefined }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el catálogo.';
      setErrors((prev) => ({ ...prev, general: message }));
      setAvailableProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const selectedProducts = useMemo(
    () => availableProducts.filter((p) => selectedIds.includes(p.id)),
    [availableProducts, selectedIds],
  );

  const totalPrice = useMemo(() => {
    if (monthsBetween === null) return 0;
    return selectedProducts.reduce((sum, p) => sum + p.pricePerMonth * monthsBetween, 0);
  }, [selectedProducts, monthsBetween]);

  const openAddProductModal = async () => {
    await loadCatalog();
    setTempSelectedIds(selectedIds);
    setCatalogModalVisible(true);
  };

  const toggleTempSelection = (id: number) => {
    setTempSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmSelection = () => {
    setSelectedIds(tempSelectedIds);
    clearFieldError('items');
    setCatalogModalVisible(false);
  };

  const validate = (): { valid: boolean; payloadDates?: { startIso: string; endIso: string } } => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = 'El nombre del kit es obligatorio.';
    else if (name.trim().length < 3) nextErrors.name = 'El nombre debe tener al menos 3 caracteres.';

    if (!country.trim()) nextErrors.country = 'El país es obligatorio.';
    if (!city.trim()) nextErrors.city = 'La ciudad es obligatoria.';

    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    if (!startIso) nextErrors.startDate = 'Fecha inválida. Usa DD/MM/AAAA, MM/DD/YYYY o YYYY-MM-DD.';
    if (!endIso) nextErrors.endDate = 'Fecha inválida. Usa DD/MM/AAAA, MM/DD/YYYY o YYYY-MM-DD.';

    if (startIso && endIso) {
      const start = toUtcDateOnly(startIso);
      const end = toUtcDateOnly(endIso);
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      if (start < today) nextErrors.startDate = 'La fecha inicial no puede ser anterior a hoy.';
      if (end < start) nextErrors.endDate = 'La fecha final no puede ser anterior a la inicial.';
    }

    if (selectedIds.length === 0) nextErrors.items = 'Debes añadir al menos un producto.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !startIso || !endIso) return { valid: false };

    return { valid: true, payloadDates: { startIso, endIso } };
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.token) {
      setErrors({ general: 'Necesitas iniciar sesión para crear un kit.' });
      return;
    }

    const validation = validate();
    if (!validation.valid || !validation.payloadDates) return;

    try {
      setSubmitting(true);

      await createKit(
        {
          name: name.trim(),
          country: country.trim(),
          city: city.trim(),
          startDate: validation.payloadDates.startIso,
          endDate: validation.payloadDates.endIso,
          tenantId: user.id,
          itemIds: selectedIds,
        },
        user.token,
      );

      Alert.alert('Kit creado', 'Tu kit se ha creado correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el kit.';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={createKitStyles.content} keyboardShouldPersistTaps="handled">
        <View style={createKitStyles.headerRow}>
          {/* TODO(Equipo): Botón volver atrás pendiente */}
          <View style={componentStyles.iconButton} />

          <Text style={[commonStyles.headerTitle, createKitStyles.headerTitle]}>Crea un Kit</Text>

          <View style={componentStyles.iconButton}>
            <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
          </View>
        </View>

        <TextInput
          style={[commonStyles.input, createKitStyles.inputRounded, errors.name && commonStyles.inputError]}
          placeholder="Nombre Kit"
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearFieldError('name');
          }}
        />
        {errors.name ? <Text style={commonStyles.errorText}>{errors.name}</Text> : null}

        <View style={createKitStyles.row}>
          <View style={createKitStyles.rowItem}>
            <TextInput
              style={[commonStyles.input, createKitStyles.inputRounded, errors.country && commonStyles.inputError]}
              placeholder="País"
              value={country}
              onChangeText={(value) => {
                setCountry(value);
                clearFieldError('country');
              }}
            />
            {errors.country ? <Text style={commonStyles.errorText}>{errors.country}</Text> : null}
          </View>

          <View style={createKitStyles.rowItem}>
            <TextInput
              style={[commonStyles.input, createKitStyles.inputRounded, errors.city && commonStyles.inputError]}
              placeholder="Ciudad"
              value={city}
              onChangeText={(value) => {
                setCity(value);
                clearFieldError('city');
              }}
            />
            {errors.city ? <Text style={commonStyles.errorText}>{errors.city}</Text> : null}
          </View>
        </View>

        <TextInput
          style={[commonStyles.input, createKitStyles.dateInput, errors.startDate && commonStyles.inputError]}
          placeholder="Fecha Inicial del Alquiler (DD/MM/AAAA)"
          value={startDate}
          onChangeText={(value) => {
            setStartDate(value);
            clearFieldError('startDate');
          }}
        />
        {errors.startDate ? <Text style={commonStyles.errorText}>{errors.startDate}</Text> : null}

        <TextInput
          style={[commonStyles.input, createKitStyles.dateInput, errors.endDate && commonStyles.inputError]}
          placeholder="Fecha Final del Alquiler (DD/MM/AAAA)"
          value={endDate}
          onChangeText={(value) => {
            setEndDate(value);
            clearFieldError('endDate');
          }}
        />
        {errors.endDate ? <Text style={commonStyles.errorText}>{errors.endDate}</Text> : null}

        {/* Duración del alquiler */}
        {monthsBetween !== null && monthsBetween > 0 && (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={commonStyles.bodySecondary}>
              Duración: {monthsBetween.toFixed(2)} meses
            </Text>
          </View>
        )}

        <View style={createKitStyles.productsHeader}>
          <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>Tus Productos</Text>
          <TouchableOpacity style={createKitStyles.addButton} onPress={openAddProductModal}>
            <Text style={createKitStyles.addButtonText}>Añadir Producto +</Text>
          </TouchableOpacity>
        </View>

        <View style={createKitStyles.counterBadge}>
          <Text style={createKitStyles.counterBadgeText}>Seleccionados: {selectedIds.length}</Text>
        </View>

        {/* Lista de items añadidos al kit */}
        {loadingCatalog ? (
          <View style={createKitStyles.loaderArea}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : selectedProducts.length === 0 ? (
          <Text style={commonStyles.bodySecondary}>
            Aún no has añadido productos al kit. Pulsa "Añadir Producto +".
          </Text>
        ) : (
          selectedProducts.map((item) => (
            <KitItemComponent key={item.id} item={item} duration={monthsBetween ?? 0} />
          ))
        )}

        {errors.items ? <Text style={commonStyles.errorText}>{errors.items}</Text> : null}
        {errors.general ? <Text style={commonStyles.errorText}>{errors.general}</Text> : null}

       
      </ScrollView>

      <View style={createKitStyles.footerRow}>
        {/* Resumen de precios */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={commonStyles.caption}>
              Subtotal productos
            </Text>
            <Text style={commonStyles.caption}>
              {totalPrice.toFixed(2)}€
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={commonStyles.caption}>
              Garantía (20%)
            </Text>
            <Text style={commonStyles.caption}>
              {(totalPrice * GUARANTEE_PERCENTAGE).toFixed(2)}€
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1, 
            borderTopColor: Colors.border,
            paddingTop: 12,
            marginBottom: 16
          }}>
            <Text style={[commonStyles.caption, { color: Colors.primary, fontWeight: '600', fontSize: 16 }]}>
              Total a pagar
            </Text>
            <Text style={[createKitStyles.productTitle, { fontSize: 20, color: Colors.primary }]}>
              {(totalPrice + totalPrice * GUARANTEE_PERCENTAGE).toFixed(2)}€
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              createKitStyles.submitButton,
              submitting && createKitStyles.submitButtonDisabled,
              { width: '100%' }
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text style={[commonStyles.primaryButtonText, createKitStyles.submitButtonText]}>
                Realizar Pedido
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={catalogModalVisible} transparent animationType="slide">
        <View style={createKitStyles.modalOverlay}>
          <View style={createKitStyles.modalCard}>
            <Text style={createKitStyles.modalTitle}>Selecciona productos</Text>

            <ScrollView style={createKitStyles.modalList}>
              {availableProducts.length === 0 ? (
                <Text style={commonStyles.bodySecondary}>No hay productos disponibles.</Text>
              ) : (
                availableProducts.map((p) => {
                  const checked = tempSelectedIds.includes(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      style={[createKitStyles.modalRow, checked && createKitStyles.modalRowChecked]}
                      onPress={() => toggleTempSelection(p.id)}
                    >
                      <View style={createKitStyles.productInfo}>
                        <Text style={createKitStyles.productTitle}>{p.title}</Text>

                        {/* TODO(Equipo): Mostrar precio por objeto individual en modal */}
                        <Text style={commonStyles.caption}>
                          {p.ownerName ? `${p.ownerName} · ` : ''}
                          {p.city ? `${p.city}` : 'Sin ciudad'}
                        </Text>
                      </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 8 }}>
                          <Text style={createKitStyles.productTitle}>
                            {p.pricePerMonth !== undefined
                              ? `${p.pricePerMonth.toFixed(2)}€` 
                              : 'N/A'}
                          </Text>
                          <Text style={commonStyles.bodySecondary}>
                            / mes
                          </Text>
                        </View>
                        <Ionicons
                          name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={checked ? Colors.success : Colors.primary}
                        />
                      
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <View style={createKitStyles.modalActions}>
              <TouchableOpacity
                style={[commonStyles.outlineButton, createKitStyles.modalBtn]}
                onPress={() => setCatalogModalVisible(false)}
              >
                <Text style={commonStyles.outlineButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.primaryButton, createKitStyles.modalBtn]}
                onPress={confirmSelection}
              >
                <Text style={commonStyles.primaryButtonText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateKitScreen;
