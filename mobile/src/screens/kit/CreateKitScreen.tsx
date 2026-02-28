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
  status: 'AVAILABLE' | 'RENTED' | 'INACTIVE' | string;
  category?: string;
  city?: string;
  ownerName?: string;
  imageUrl?: string | null;
};

const toIsoDate = (raw: string): string | null => {
  const value = raw.trim();

  const dmyFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = value.match(dmyFormat);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const valid =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!valid) return null;

  // Convertimos a ISO para backend: YYYY-MM-DD
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

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

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'RENTED' | 'INACTIVE'>('ALL');

  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCategory, setAppliedCategory] = useState<'ALL' | string>('ALL');
  const [appliedStatus, setAppliedStatus] = useState<'ALL' | 'AVAILABLE' | 'RENTED' | 'INACTIVE'>('ALL');
  const [hasSearched, setHasSearched] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Respuesta no JSON: ${text}`);
      }

      const raw = JSON.parse(text);

      const mapped: CatalogProduct[] = (raw ?? []).map((p: any) => ({
        id: Number(p.id),
        title: p.title ?? 'Sin título',
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? 'AVAILABLE'),
        category: p.category ?? 'Sin categoría',
        city: p.city ?? '',
        ownerName: p.owner?.name ?? '',
        imageUrl: p.imageUrl ?? null,
      }));

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

  const categories = useMemo(() => {
    const set = new Set(
      availableProducts
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c)),
    );
    return ['ALL', ...Array.from(set)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();

    return availableProducts.filter((p) => {
      const byStatus = appliedStatus === 'ALL' || p.status === appliedStatus;
      const byCategory = appliedCategory === 'ALL' || p.category === appliedCategory;
      const bySearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.city ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q);

      return byStatus && byCategory && bySearch;
    });
  }, [availableProducts, appliedSearch, appliedCategory, appliedStatus]);

  const openAddProductModal = async () => {
    await loadCatalog();
    setTempSelectedIds(selectedIds);

    setSearchText('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');

    setAppliedSearch('');
    setAppliedCategory('ALL');
    setAppliedStatus('ALL');
    setHasSearched(false);

    setCatalogModalVisible(true);
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchText);
    setAppliedCategory(categoryFilter);
    setAppliedStatus(statusFilter);
    setHasSearched(true);
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

    if (!startIso) nextErrors.startDate = 'Fecha inválida. Usa DD/MM/YYYY.';
    if (!endIso) nextErrors.endDate = 'Fecha inválida. Usa DD/MM/YYYY.';

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
          placeholder="Fecha Inicial del Alquiler (DD/MM/YYYY)"
          value={startDate}
          onChangeText={(value) => {
            setStartDate(value);
            clearFieldError('startDate');
          }}
        />
        {errors.startDate ? <Text style={commonStyles.errorText}>{errors.startDate}</Text> : null}

        <TextInput
          style={[commonStyles.input, createKitStyles.dateInput, errors.endDate && commonStyles.inputError]}
          placeholder="Fecha Final del Alquiler (DD/MM/YYYY)"
          value={endDate}
          onChangeText={(value) => {
            setEndDate(value);
            clearFieldError('endDate');
          }}
        />
        {errors.endDate ? <Text style={commonStyles.errorText}>{errors.endDate}</Text> : null}

        <View style={createKitStyles.productsHeader}>
          <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>Tus Productos</Text>
          <TouchableOpacity style={createKitStyles.addButton} onPress={openAddProductModal}>
            <Text style={createKitStyles.addButtonText}>Añadir Producto +</Text>
          </TouchableOpacity>
        </View>

        <View style={createKitStyles.counterBadge}>
          <Text style={createKitStyles.counterBadgeText}>Seleccionados: {selectedIds.length}</Text>
        </View>

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
            <View
              key={item.id}
              style={[componentStyles.listItem, createKitStyles.productRow, createKitStyles.productRowSelected]}
            >
              <View style={createKitStyles.productThumb}>
                <Ionicons name="cube-outline" size={24} color={Colors.primary} />
              </View>

              <View style={createKitStyles.productInfo}>
                <Text style={createKitStyles.productTitle}>{item.title}</Text>
                <Text style={commonStyles.caption}>{item.city ? `${item.city}` : 'Sin ciudad'}</Text>
              </View>
            </View>
          ))
        )}

        {errors.items ? <Text style={commonStyles.errorText}>{errors.items}</Text> : null}
        {errors.general ? <Text style={commonStyles.errorText}>{errors.general}</Text> : null}

        <View style={createKitStyles.footerRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              createKitStyles.submitButton,
              submitting && createKitStyles.submitButtonDisabled,
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
      </ScrollView>

      <Modal visible={catalogModalVisible} transparent animationType="slide">
        <View style={createKitStyles.modalOverlay}>
          <View style={createKitStyles.modalCard}>
            <Text style={createKitStyles.modalTitle}>Selecciona productos</Text>

            <View style={{ gap: 8, marginBottom: 12 }}>
              <View style={[commonStyles.input, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
                <TextInput
                  placeholder="Buscar objeto..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{ flex: 1, color: Colors.textPrimary }}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {(['ALL', 'AVAILABLE', 'RENTED', 'INACTIVE'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: statusFilter === s ? Colors.primary : Colors.border,
                      backgroundColor: statusFilter === s ? '#EAF3F8' : Colors.backgroundWhite,
                    }}
                  >
                    <Text style={{ color: Colors.primary }}>{s === 'ALL' ? 'Todos' : s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategoryFilter(c)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: categoryFilter === c ? Colors.primary : Colors.border,
                      backgroundColor: categoryFilter === c ? '#EAF3F8' : Colors.backgroundWhite,
                    }}
                  >
                    <Text style={{ color: Colors.primary }}>{c === 'ALL' ? 'Todas' : c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={[commonStyles.primaryButton, { marginBottom: 12 }]} onPress={handleApplyFilters}>
              <Text style={commonStyles.primaryButtonText}>Buscar</Text>
            </TouchableOpacity>

            <ScrollView style={createKitStyles.modalList}>
              {!hasSearched ? (
                <Text style={commonStyles.bodySecondary}>Configura los filtros y pulsa "Buscar".</Text>
              ) : filteredProducts.length === 0 ? (
                <Text style={commonStyles.bodySecondary}>No hay productos que cumplan los filtros.</Text>
              ) : (
                filteredProducts.map((p) => {
                  const checked = tempSelectedIds.includes(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      style={[createKitStyles.modalRow, checked && createKitStyles.modalRowChecked]}
                      onPress={() => toggleTempSelection(p.id)}
                    >
                      <View style={createKitStyles.productInfo}>
                        <Text style={createKitStyles.productTitle}>{p.title}</Text>
                        <Text style={commonStyles.caption}>
                          {p.ownerName ? `${p.ownerName} · ` : ''}
                          {p.city ? `${p.city} · ` : ''}
                          {p.category ? `${p.category} · ` : ''}
                          €{p.pricePerMonth}
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
