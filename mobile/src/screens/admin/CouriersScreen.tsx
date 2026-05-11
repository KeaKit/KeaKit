import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers } from "../../services/adminService";
import { RootStackParamList, UserResponse } from "../../types";
import { Colors, Spacing, commonStyles } from "../../styles";
import { SelectPicker } from "../../components/SelectPicker";
import { useLocationPicker } from "../../hooks/useLocationPicker";
import { getBusyCouriers } from "../../services/kitService";
import { Helmet } from 'react-helmet-async'; 


type CouriersNav = NativeStackNavigationProp<RootStackParamList, "Couriers">;

const CouriersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CouriersNav>();

  const [couriers, setCouriers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCountry, cities, loadingCities, onCountryChange, countries } = useLocationPicker("", "");
  const [city, setCity] = useState("");
  const [busyIds, setBusyIds] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!user) return;
        setLoading(true);
        const data = await getAllUsers(user.token);
        const onlyCouriers = data.filter((u) => u.role === "COURIER");
        setCouriers(onlyCouriers);

        const busy = await getBusyCouriers(user.token, selectedCountry, city);
        setBusyIds(busy);

        setLoading(false);
      };
      load();
    }, [user])
  );

  const filtered = couriers.filter((c) => {
    if (selectedCountry && c.country !== selectedCountry) return false;
    if (city && c.city !== city) return false;
    return true;
  });


  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando couriers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Gestión de Repartidores | KeaKit</title>
        <meta name="description" content="Listado y gestión de repartidores de la plataforma KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couriers</Text>
        <View style={{ width: 40 }} />
      </View>

            <View style={styles.filtersCard}>
        <View style={styles.fieldWrapper}>
          <View style={styles.inputContainer}>
            <Ionicons name="earth-outline" size={20} color="#999" style={styles.fieldIcon} />
            <SelectPicker
              options={countries}
              selectedValue={selectedCountry}
              placeholder="País"
              onValueChange={(value: string) => {
                onCountryChange(value);
                setCity("");
              }}
            />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#999" style={styles.fieldIcon} />
            {loadingCities ? (
              <ActivityIndicator size="small" color="#999" style={{ flex: 1 }} />
            ) : (
              <SelectPicker
                options={cities.map((c) => ({ label: c, value: c }))}
                selectedValue={city}
                placeholder={selectedCountry ? "Ciudad" : "Primero elige un país"}
                disabled={cities.length === 0}
                onValueChange={(value: string) => setCity(value)}
              />
            )}
          </View>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay repartidores disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => navigation.navigate("CourierDetail", { courier: item, isBusy: busyIds.includes(item.id) })}
            >
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userCountry}>{item.country}</Text>

                {busyIds.includes(item.id) && (
                  <View style={styles.busyBadge}>
                    <Text style={styles.busyBadgeText}>OCUPADO</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default CouriersScreen;

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.lg },
  loadingText: { marginTop: Spacing.md, fontSize: 16, color: "#666" },
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary },
  listContent: { padding: Spacing.md },
    filtersCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldWrapper: { marginBottom: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  fieldIcon: { marginRight: 8 },

  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  userEmail: { fontSize: 12, color: "#777", marginTop: 2 },
  userCountry: { fontSize: 12, color: Colors.primary, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  emptyText: { fontSize: 16, color: "#666", marginTop: Spacing.md, textAlign: "center" },

  busyBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#ffe8e8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  busyBadgeText: {
    color: "#d9534f",
    fontSize: 10,
    fontWeight: "700",
  },
});
