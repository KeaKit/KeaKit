import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Animated, Alert, ActivityIndicator, Switch, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  PilotUserResponse,
  getAllPilotUsers,
  createPilotUser,
  updatePilotUser,
  bulkSetActivePilotUsers,
} from '../../services/pilotUserService';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';

type PilotUsersNav = NativeStackNavigationProp<RootStackParamList, 'PilotUsers'>;

const KC = {
  cream: '#fcfff5', blue: '#2d6e91', blueDark: '#1e526e',
  gray: '#595959', grayLight: '#f0f0f0', white: '#FFFFFF',
  mint: '#c3f1d1', mintDark: '#4caf7d', error: '#e74c3c',
  errorBg: '#fdf0f0', border: '#dde3ea', lavender: '#d6d0f8',
  coral: '#FFD6C0', coralDark: '#e07b50',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

const PilotUsersScreen: React.FC = () => {
  const navigation = useNavigation<PilotUsersNav>();
  const navbarOffset = useNavbarOffset();
  const { user } = useAuth();

  const [pilotUsers,    setPilotUsers]    = useState<PilotUserResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selected,      setSelected]      = useState<Set<number>>(new Set());
  const [bulkLoading,   setBulkLoading]   = useState(false);

  // Formulario inline añadir/editar
  const [editingId,     setEditingId]     = useState<number | null>(null);  // null = nuevo
  const [formVisible,   setFormVisible]   = useState(false);
  const [formEmail,     setFormEmail]     = useState('');
  const [formActive,    setFormActive]    = useState(true);
  const [formError,     setFormError]     = useState('');
  const [formSaving,    setFormSaving]    = useState(false);

  const load = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const data = await getAllPilotUsers(user.token);
      setPilotUsers(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios piloto.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Filtro de búsqueda ─────────────────────────────────────────────────────
  const filtered = pilotUsers.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Selección ──────────────────────────────────────────────────────────────
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
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.add(p.id));
        return next;
      });
    }
  };

  // ── Acciones bulk ──────────────────────────────────────────────────────────
  const handleBulkActive = async (active: boolean) => {
    if (!user?.token || selected.size === 0) return;
    setBulkLoading(true);
    try {
      await bulkSetActivePilotUsers(user.token, Array.from(selected), active);
      setPilotUsers(prev => prev.map(p => selected.has(p.id) ? { ...p, active } : p));
      setSelected(new Set());
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    } finally {
      setBulkLoading(false);
    }
  };


  const openNew = () => {
    setEditingId(null);
    setFormEmail('');
    setFormActive(true);
    setFormError('');
    setFormVisible(true);
  };

  const openEdit = (p: PilotUserResponse) => {
    setEditingId(p.id);
    setFormEmail(p.email);
    setFormActive(p.active);
    setFormError('');
    setFormVisible(true);
  };

  const closeForm = () => { setFormVisible(false); setFormError(''); };

  const handleFormSave = async () => {
    const trimmed = formEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      setFormError('Introduce un email con formato válido (usuario@dominio.com)');
      return;
    }
    if (!user?.token) return;
    setFormSaving(true);
    try {
      if (editingId !== null) {
        const updated = await updatePilotUser(user.token, editingId, { email: trimmed, active: formActive });
        setPilotUsers(prev => prev.map(p => p.id === editingId ? updated : p));
      } else {
        const created = await createPilotUser(user.token, { email: trimmed, active: formActive });
        setPilotUsers(prev => [created, ...prev]);
      }
      closeForm();
    } catch (e: any) {
      setFormError(e.message ?? 'No se pudo guardar.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggleSingle = async (p: PilotUserResponse) => {
    if (!user?.token) return;
    try {
      const updated = await updatePilotUser(user.token, p.id, { email: p.email, active: !p.active });
      setPilotUsers(prev => prev.map(u => u.id === p.id ? updated : u));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar.');
    }
  };

  const renderItem = ({ item, index }: { item: PilotUserResponse; index: number }) => {
    const isSelected = selected.has(item.id);
    return (
      <FadeIn delay={index * 40}>
        <View style={[styles.card, !item.active && styles.cardInactive, isSelected && styles.cardSelected]}>
          {/* Checkbox */}
          <TouchableOpacity style={styles.checkboxWrap} onPress={() => toggleSelect(item.id)}>
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Ionicons name="checkmark" size={14} color={KC.white} />}
            </View>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.cardBody}>
            <View style={styles.emailRow}>
              <Ionicons name="person-circle-outline" size={18} color={item.active ? KC.blue : KC.gray} />
              <Text style={[styles.emailText, !item.active && styles.emailInactive]}>{item.email}</Text>
            </View>
            <Text style={[styles.statusBadge, item.active ? styles.statusActive : styles.statusInactive]}>
              {item.active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>

          {/* Acciones */}
          <View style={styles.cardActions}>
            <Switch
              value={item.active}
              onValueChange={() => handleToggleSingle(item)}
              trackColor={{ false: KC.border, true: KC.mint }}
              thumbColor={item.active ? KC.mintDark : KC.grayLight}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Ionicons name="pencil-outline" size={18} color={KC.blue} />
            </TouchableOpacity>
          </View>
        </View>
      </FadeIn>
    );
  };

  return (
    <SafeAreaView style={[styles.root, {paddingBottom: navbarOffset}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={KC.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios piloto</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
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
          placeholder="Buscar por email..."
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={KC.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Formulario inline */}
      {formVisible && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId !== null ? 'Editar usuario' : 'Nuevo usuario piloto'}</Text>
          <TextInput
            style={[styles.formInput, !!formError && styles.formInputError]}
            value={formEmail}
            onChangeText={t => { setFormEmail(t); setFormError(''); }}
            placeholder="email@dominio.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!formSaving}
          />
          {!!formError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={KC.error} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}
          <View style={styles.formToggleRow}>
            <Text style={styles.formToggleLabel}>Activo</Text>
            <Switch
              value={formActive}
              onValueChange={setFormActive}
              trackColor={{ false: KC.border, true: KC.mint }}
              thumbColor={formActive ? KC.mintDark : KC.grayLight}
            />
          </View>
          <View style={styles.formBtns}>
            <TouchableOpacity style={styles.formBtnCancel} onPress={closeForm} disabled={formSaving}>
              <Text style={styles.formBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formBtnSave, formSaving && { opacity: 0.5 }]}
              onPress={handleFormSave}
              disabled={formSaving}
            >
              {formSaving
                ? <ActivityIndicator color={KC.white} size="small" />
                : <Text style={styles.formBtnSaveText}>Guardar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Barra de selección bulk */}
      {selected.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>{selected.size} seleccionado(s)</Text>
          <View style={styles.bulkActions}>
            {bulkLoading
              ? <ActivityIndicator color={KC.blue} size="small" />
              : (
                <>
                  <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkActive(true)}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={KC.mintDark} />
                    <Text style={[styles.bulkBtnText, { color: KC.mintDark }]}>Activar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkActive(false)}>
                    <Ionicons name="pause-circle-outline" size={18} color={KC.coralDark} />
                    <Text style={[styles.bulkBtnText, { color: KC.coralDark }]}>Desactivar</Text>
                  </TouchableOpacity>
                </>
              )
            }
          </View>
        </View>
      )}

      {/* Seleccionar todos / contador */}
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
          <Text style={styles.countText}>{filtered.length} usuario(s)</Text>
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
              <Ionicons name="person-outline" size={48} color={KC.border} />
              <Text style={styles.emptyText}>
                {search ? 'Sin resultados para tu búsqueda' : 'No hay usuarios piloto'}
              </Text>
              {!search && <Text style={styles.emptySubText}>Pulsa + para añadir el primero</Text>}
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
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10,
    backgroundColor: KC.white, borderRadius: 14, paddingHorizontal: 12, height: 44,
    borderWidth: 1.5, borderColor: KC.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: KC.blueDark },

  // Formulario inline
  formCard: {
    marginHorizontal: 16, marginBottom: 10, backgroundColor: KC.white, borderRadius: 18,
    padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: KC.blue },
  formInput: {
    height: 48, borderWidth: 1.5, borderColor: KC.border, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 15, color: KC.blueDark, backgroundColor: '#f8fbff',
  },
  formInputError: { borderColor: KC.error, backgroundColor: KC.errorBg },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 13, color: KC.error },
  formToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formToggleLabel: { fontSize: 14, fontWeight: '700', color: KC.blueDark },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  formBtnCancel: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: KC.border,
    alignItems: 'center', justifyContent: 'center',
  },
  formBtnCancelText: { fontSize: 15, fontWeight: '700', color: KC.gray },
  formBtnSave: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: KC.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  formBtnSaveText: { fontSize: 15, fontWeight: '700', color: KC.white },

  // Bulk bar
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
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: KC.white,
    borderRadius: 16, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardInactive: { opacity: 0.55 },
  cardSelected: { borderWidth: 2, borderColor: KC.blue },
  checkboxWrap: { padding: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: KC.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: KC.white,
  },
  checkboxChecked: { backgroundColor: KC.blue, borderColor: KC.blue },
  cardBody: { flex: 1, gap: 4 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emailText: { fontSize: 14, fontWeight: '600', color: KC.blueDark, flex: 1 },
  emailInactive: { color: KC.gray },
  statusBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  statusActive: { color: KC.mintDark },
  statusInactive: { color: KC.gray },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionBtn: { padding: 6 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '700', color: KC.gray, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#aaa' },
});

export default PilotUsersScreen;