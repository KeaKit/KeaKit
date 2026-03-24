import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAllPromoCodes, updatePromoCode, PromoCodeResponse } from '../../services/promoCodeService';

type PromoCodesNav = NativeStackNavigationProp<RootStackParamList, 'PromoCodes'>;

const KC = {
  cream: '#fcfff5', blue: '#2d6e91', blueDark: '#1e526e',
  gray: '#595959', grayLight: '#f0f0f0', white: '#FFFFFF',
  mint: '#c3f1d1', mintDark: '#4caf7d', error: '#e74c3c',
  errorBg: '#fdf0f0', border: '#dde3ea', lavender: '#d6d0f8',
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
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCodeResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleActive = async (promo: PromoCodeResponse) => {
    if (!user?.token) return;
    try {
      const updated = await updatePromoCode(user.token, promo.id, {
        ...promo,
        active: !promo.active,
      });
      setPromoCodes(prev => prev.map(p => p.id === promo.id ? updated : p));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado del código.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
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

      {loading ? (
        <ActivityIndicator color={KC.blue} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {promoCodes.length === 0 && (
            <FadeIn>
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={48} color={KC.border} />
                <Text style={styles.emptyText}>No hay códigos promocionales</Text>
                <Text style={styles.emptySubText}>Pulsa + para crear el primero</Text>
              </View>
            </FadeIn>
          )}
          {promoCodes.map((promo, idx) => (
            <FadeIn key={promo.id} delay={idx * 60}>
              <View style={[styles.card, !promo.active && styles.cardInactive]}>
                {/* Header de la tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{promo.code}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('PromoCodeForm', { promoCode: promo, mode: 'edit' })}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="pencil-outline" size={20} color={KC.blue} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="cut-outline" size={15} color={KC.gray} />
                    <Text style={styles.infoText}>
                      Descuento: <Text style={styles.infoValue}>{(promo.discountRate * 100).toFixed(0)}%</Text>
                    </Text>
                  </View>
                  {promo.pilotUserOnly && (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={15} color={KC.blue} />
                      <Text style={styles.infoText}>
                        Usuario piloto · <Text style={styles.infoValue}>{promo.pilotEmails.length} emails</Text>
                      </Text>
                    </View>
                  )}
                  {promo.singleUse && !promo.pilotUserOnly && (
                    <View style={styles.infoRow}>
                      <Ionicons name="alert-circle-outline" size={15} color={KC.gray} />
                      <Text style={styles.infoText}>Un solo uso</Text>
                    </View>
                  )}
                </View>

                {/* Toggle activo */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{promo.active ? 'Activo' : 'Inactivo'}</Text>
                  <Switch
                    value={promo.active}
                    onValueChange={() => handleToggleActive(promo)}
                    trackColor={{ false: KC.border, true: KC.mint }}
                    thumbColor={promo.active ? KC.mintDark : KC.grayLight}
                  />
                </View>
              </View>
            </FadeIn>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KC.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: KC.cream,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: KC.blue, letterSpacing: -0.3 },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: KC.white, borderRadius: 18, padding: 18, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeBadge: {
    backgroundColor: KC.lavender, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  codeText: { fontSize: 16, fontWeight: '800', color: KC.blueDark, letterSpacing: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  cardInfo: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: KC.gray },
  infoValue: { fontWeight: '700', color: KC.blueDark },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: KC.border, paddingTop: 12, marginTop: 4,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: KC.gray },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '700', color: KC.gray },
  emptySubText: { fontSize: 13, color: '#aaa' },
});

export default PromoCodesScreen;