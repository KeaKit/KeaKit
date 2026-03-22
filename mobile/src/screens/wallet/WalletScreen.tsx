import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Header,
  KeakitModal,
  SkeletonPulse,
  FadeInItem,
  KeakitButton,
} from "../../components";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList, Wallet, Transaction } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  getLoggedUserWallet,
  getLoggedUserTransactions,
} from "../../services/walletService";
import { Colors, commonStyles, FontSizes, FontWeights } from "../../styles";
import { ActivityIndicator } from "react-native-paper";

type WalletNav = NativeStackNavigationProp<RootStackParamList, "Wallet">;

const TransactionItem = ({
  item,
  index,
}: {
  item: Transaction;
  index: number;
}) => {
  const isNegative = item.amount < 0;

  const BASE_DELAY = 450;
  const STAGGER = 300;
  const calculatedDelay = BASE_DELAY + index * STAGGER;

  return (
    <FadeInItem delay={calculatedDelay}>
      <View style={styles.transactionCard}>
        <View>
          <Text style={[commonStyles.body, { fontWeight: FontWeights.bold }]}>
            {item.type.replace("_", " ")}
          </Text>
          <Text style={commonStyles.caption}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            commonStyles.body,
            { fontWeight: FontWeights.bold },
            { color: isNegative ? "#E74C3C" : "#2ECC71" },
          ]}
        >
          {isNegative ? "" : "+"}
          {item.amount.toFixed(2)} €
        </Text>
      </View>
    </FadeInItem>
  );
};

export default function WalletScreen() {
  const navigation = useNavigation<WalletNav>();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoadingWallet(true);
        const walletData = await getLoggedUserWallet(user?.token ?? "");
        setWallet(walletData);
      } catch (error) {
        console.error("Error al obtener la wallet:", error);
        setError("No se pudo cargar tu wallet. " + (error as Error).message);
        setErrorModalVisible(true);
      } finally {
        setLoadingWallet(false);
      }
    };
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        const transactionsData = await getLoggedUserTransactions(
          user?.token ?? "",
        );
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error al obtener las transacciones:", error);
        setError(
          "No se pudo cargar el historial de transacciones. " +
            (error as Error).message,
        );
        setErrorModalVisible(true);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (user?.token) {
      fetchWallet();
      fetchTransactions();
    }
  }, [user?.token]);

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header title="Mi Wallet" showBack={true} onBack={navigation.goBack} />
        <View style={styles.content} >
      {/* Tarjeta de Balance */}
      <FadeInItem delay={50}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          {loadingWallet ? (
            <SkeletonPulse width={120} height={48} radius={8} dark />
          ) : (
            <Text style={styles.balanceValue}>
              {wallet
                ? wallet.balance.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0,00"}{" "}
              €
            </Text>
          )}
        </View>
      </FadeInItem>

      <View style={commonStyles.divider} />

      {/* Historial */}
      <View style={styles.historyContainer}>
        <Text style={commonStyles.subtitle}>Historial de Transacciones</Text>
        {loadingTransactions ? (
          <ActivityIndicator
            size="large"
            color={Colors.primaryHome}
            style={{ marginTop: 20, justifyContent: "center", flex: 1 }}
          />
        ) : transactions.length === 0 ? (
          <Text style={commonStyles.caption}>No tienes transacciones aún.</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TransactionItem item={item} index={index} /> // <--- Pasamos el index
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      </View>
      
        <View style={commonStyles.footerContainer} >
            <FadeInItem delay={50}>
            <KeakitButton
            title="Retirar dinero"
            onPress={() => console.log("Navegar a formulario de retiro")}
        /></FadeInItem>
        </View>
        
      <KeakitModal
        visible={errorModalVisible}
        onDismiss={() => setErrorModalVisible(false)}
        message={error ?? "Ha ocurrido un error."}
        variant="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "space-between",
    padding:20
  },
  balanceCard: {
    ...commonStyles.card,
    backgroundColor: Colors.primaryHome,
    
    minHeight: 150,
    justifyContent: "space-between",
  },
  balanceLabel: {
    ...commonStyles.subtitle,
    color: Colors.white,
  },
  balanceValue: {
    ...commonStyles.title,
    color: Colors.white,
    fontSize: FontSizes.giant,
  },
  historyContainer: {
    flex: 1,
  },
  transactionCard: {
    ...commonStyles.cardSmall,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryHome,
  },
});
