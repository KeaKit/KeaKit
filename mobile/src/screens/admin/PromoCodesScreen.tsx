import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Animated, Alert, ActivityIndicator, Switch, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAllPromoCodes, updatePromoCode, PromoCodeResponse } from '../../services/promoCodeService';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';
import { Helmet } from 'react-helmet-async'; 


type PromoCodesNav = NativeStackNavigationProp<RootStackParamList, 'PromoCodes'>;

const KC = {
  cream: '#fcfff5', blue: '#2d6e91', blueDark: '#1e526e',
  gray: '#595959', grayLight: '#f0f0f0', white: '#FFFFFF',
  mint: '#c3f1d1', mintDark: '#4caf7d', error: '#e74c3c',
  errorBg: '#fdf0f0', border: '#dde3ea', lavender: '#d6d0f8',
  coral: '#FFD6C0', coralDark: '#e07b50',
};

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

const PromoCodesScreen: React.FC = () => {
  const navigation = useNavigation<PromoCodesNav>();
  const navbarOffset = useNavbarOffset();
  const { user } = useAuth();

  const [promoCodes,  setPromoCodes]  = useState<PromoCodeResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const data = await getAllPromoCodes(user.token);
      setPromoCodes(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los códigos promocionales.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Filtro
  const filtered = promoCodes.filter(p =>
    p.code.toLowerCase().includes(search.toLowerCase()),
  );

  // Selección
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.delete(p.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.add(p.id)); return n; });
    }
  };

  // Toggle individual
  const handleToggleActive = async (promo: PromoCodeResponse) => {
    if (!user?.token) return;
    try {
      const updated = await updatePromoCode(user.token, promo.id, { ...promo, active: !promo.active });
      setPromoCodes(prev => prev.map(p => p.id === promo.id ? updated : p));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado del código.');
    }
  };

  // Desactivar
  const handleBulkDeactivate = async () => {
    if (!user?.token || selected.size === 0) return;
    setBulkLoading(true);
    try {
      const targets = promoCodes.filter(p => selected.has(p.id));
      const updates = targets.map(p =>
        updatePromoCode(user.token!, p.id, { ...p, active: false }),
      );
      const results = await Promise.all(updates);
      setPromoCodes(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(p => map.get(p.id) ?? p);
      });
      setSelected(new Set());
    } catch {
      Alert.alert('Error', 'No se pudieron desactivar algunos códigos.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (!user?.token || selected.size === 0) return;
    setBulkLoading(true);
    try {
      const targets = promoCodes.filter(p => selected.has(p.id));
      const updates = targets.map(p =>
        updatePromoCode(user.token!, p.id, { ...p, active: true }),
      );
      const results = await Promise.all(updates);
      setPromoCodes(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(p => map.get(p.id) ?? p);
      });
      setSelected(new Set());
    } catch {
      Alert.alert('Error', 'No se pudieron activar algunos códigos.');
    } finally {
      setBulkLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: PromoCodeResponse; index: number }) => {
    const isSelected = selected.has(item.id);
    return (
      <FadeIn delay={index * 50}>
        <View style={[styles.card, !item.active && styles.cardInactive, isSelected && styles.cardSelected]}>
          {/* Checkbox */}
          <TouchableOpacity style={styles.checkboxWrap} onPress={() => toggleSelect(item.id)}>
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Ionicons name="checkmark" size={14} color={KC.white} />}
            </View>
          </TouchableOpacity>

          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('PromoCodeForm', { promoCode: item, mode: 'edit' })}
                style={styles.actionBtn}
              >
                <Ionicons name="pencil-outline" size={20} color={KC.blue} />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="cut-outline" size={14} color={KC.gray} />
                <Text style={styles.infoText}>
                  Descuento: <Text style={styles.infoValue}>{(item.discountRate * 100).toFixed(0)}%</Text>
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="pricetag-outline" size={14} color={KC.gray} />
                <Text style={styles.infoText}>
                  Tipo:{' '}
                  <Text style={styles.infoValue}>
                    {(item.type ?? 'TENANT_DISCOUNT') === 'OWNER_COMMISSION_REDUCTION'
                      ? 'Comisión owner'
                      : 'Alquiler kit'}
                  </Text>
                </Text>
              </View>
              {item.pilotUserOnly && (
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={14} color={KC.blue} />
                  <Text style={styles.infoText}>
                    Piloto · <Text style={styles.infoValue}>{item.pilotEmails.length} emails</Text>
                  </Text>
                </View>
              )}
              {item.singleUse && !item.pilotUserOnly && (
                <View style={styles.infoRow}>
                  <Ionicons name="alert-circle-outline" size={14} color={KC.gray} />
                  <Text style={styles.infoText}>Un solo uso</Text>
                </View>
              )}
            </View>

            {/* Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{item.active ? 'Activo' : 'Inactivo'}</Text>
              <Switch
                value={item.active}
                onValueChange={() => handleToggleActive(item)}
                trackColor={{ false: KC.border, true: KC.mint }}
                thumbColor={item.active ? KC.mintDark : KC.grayLight}
              />
            </View>
          </View>
        </View>
      </FadeIn>
    );
  };

  return (
    <SafeAreaView style={[styles.root, {paddingBottom: navbarOffset}]}>

      <Helmet>
        <title>Códigos Promocionales | KeaKit</title>
        <meta name="description" content="Gestión de códigos promocionales y descuentos de la plataforma KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={KC.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Códigos promocionales</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('PromoCodeForm', { mode: 'create' })}
        >
          <Ionicons name="add" size={26} color={KC.blue} />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={KC.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por código..."
          placeholderTextColor="#aaa"
          autoCapitalize="characters"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={KC.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Barra sectora*/}
      {selected.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>{selected.size} seleccionado(s)</Text>
          <View style={styles.bulkActions}>
            {bulkLoading
              ? <ActivityIndicator color={KC.blue} size="small" />
              : (
                <>
                  <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkActivate}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={KC.mintDark} />
                    <Text style={[styles.bulkBtnText, { color: KC.mintDark }]}>Activar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkDeactivate}>
                    <Ionicons name="pause-circle-outline" size={18} color={KC.coralDark} />
                    <Text style={[styles.bulkBtnText, { color: KC.coralDark }]}>Desactivar</Text>
                  </TouchableOpacity>
                </>
              )
            }
          </View>
        </View>
      )}

      {/* Seleccionar todos */}
      {!loading && filtered.length > 0 && (
        <View style={styles.selectAllRow}>
          <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
            <View style={[styles.checkbox, allFilteredSelected && styles.checkboxChecked]}>
              {allFilteredSelected && <Ionicons name="checkmark" size={14} color={KC.white} />}
            </View>
            <Text style={styles.selectAllText}>
              {allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{filtered.length} código(s)</Text>
        </View>
      )}

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={KC.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color={KC.border} />
              <Text style={styles.emptyText}>
                {search ? 'Sin resultados para tu búsqueda' : 'No hay códigos promocionales'}
              </Text>
              {!search && <Text style={styles.emptySubText}>Pulsa + para crear el primero</Text>}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KC.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: KC.cream,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: KC.blue, letterSpacing: -0.3 },

  // Buscador
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8,
    backgroundColor: KC.white, borderRadius: 14, paddingHorizontal: 12, height: 44,
    borderWidth: 1.5, borderColor: KC.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: KC.blueDark },

  // Barra selectora
  bulkBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#eaf4fb',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: KC.border,
  },
  bulkText: { fontSize: 13, fontWeight: '700', color: KC.blue },
  bulkActions: { flexDirection: 'row', gap: 14 },
  bulkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bulkBtnText: { fontSize: 13, fontWeight: '700' },

  // Seleccionar todos
  selectAllRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 6,
  },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { fontSize: 13, fontWeight: '600', color: KC.gray },
  countText: { fontSize: 12, color: '#aaa' },

  // Card
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: KC.white,
    borderRadius: 18, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardInactive: { opacity: 0.6 },
  cardSelected: { borderWidth: 2, borderColor: KC.blue },
  checkboxWrap: { paddingTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: KC.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: KC.white,
  },
  checkboxChecked: { backgroundColor: KC.blue, borderColor: KC.blue },
  cardContent: { flex: 1, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeBadge: {
    backgroundColor: KC.lavender, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  codeText: { fontSize: 15, fontWeight: '800', color: KC.blueDark, letterSpacing: 1 },
  actionBtn: { padding: 6 },
  cardInfo: { gap: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { fontSize: 13, color: KC.gray },
  infoValue: { fontWeight: '700', color: KC.blueDark },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: KC.border, paddingTop: 10,
  },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: KC.gray },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '700', color: KC.gray, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#aaa' },
});

export default PromoCodesScreen;