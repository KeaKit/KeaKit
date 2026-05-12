import React, { useState } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import {
  Header,
  KeakitModal,
  SkeletonPulse,
  FadeInItem,
  KeakitButton,
} from "../../components";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList, Wallet, Transaction } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  getLoggedUserWallet,
  getLoggedUserTransactions,
} from "../../services/walletService";
import { Colors, commonStyles, FontSizes, FontWeights } from "../../styles";
import { ActivityIndicator } from "react-native-paper";

type WalletNav = NativeStackNavigationProp<RootStackParamList, "Wallet">;

const transactionTypeLabels: Record<string, string> = {
  TOP_UP: "Ingreso",
  FEE: "Comision",
  GUARANTEE_DEPOSIT: "Deposito de fianza",
  GUARANTEE_REFUND: "Devolucion de fianza",
  REFUND: "Reembolso",
};

const getTransactionLabel = (transaction: Transaction) => {
  if (transaction.type === "PAYOUT") {
    return transaction.amount < 0 ? "Pago de kit" : "Ingreso";
  }
  return transactionTypeLabels[transaction.type] ?? transaction.type.replaceAll("_", " ");
};

const TransactionItem = ({
  item,
  index,
  onPress,
}: {
  item: Transaction;
  index: number;
  onPress: () => void;
}) => {
  const isNegative = item.amount < 0;
  const type = getTransactionLabel(item);

  const BASE_DELAY = 450;
  const STAGGER = 300;
  const calculatedDelay = BASE_DELAY + index * STAGGER;

  return (
    <FadeInItem delay={calculatedDelay}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.transactionCard}>
          <View>
            <Text style={[commonStyles.body, { fontWeight: FontWeights.bold }]}>
              {type}
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
      </TouchableOpacity>
    </FadeInItem>
  );
};

export default function WalletScreen() {
  const navigation = useNavigation<WalletNav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const fetchWalletData = async () => {
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

  const fetchTransactionsData = async () => {
    try {
      setLoadingTransactions(true);
      const transactionsData = await getLoggedUserTransactions(user?.token ?? "");
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

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate("TransactionDetail", {
      transactionId: transaction.id,
      transactionType: transaction.type,
      transactionAmount: transaction.amount,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.token) {
        fetchWalletData();
        fetchTransactionsData();
      }
    }, [user?.token]),
  );

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
      <Header title="Mi Wallet" showBack={true} onBack={navigation.goBack} />
      <View style={styles.content}>
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
                <TransactionItem
                  item={item}
                  index={index}
                  onPress={() => handleTransactionPress(item)}
                />
              )}
              contentContainerStyle={{ paddingBottom: insets.bottom + 85 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <View style={[commonStyles.footerContainer, { paddingBottom: insets.bottom + 35 }]}>
        <FadeInItem delay={50}>
          <KeakitButton
            title="Retirar dinero"
            onPress={() => navigation.navigate("WithdrawMoney")}
          />
        </FadeInItem>
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
    padding: 20,
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