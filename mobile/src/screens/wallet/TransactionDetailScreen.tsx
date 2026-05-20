import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList, TransactionWithDetails } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { getTransactionDetails } from "../../services/walletService";
import { Colors, commonStyles, FontSizes, FontWeights, Spacing, BorderRadius } from "../../styles";
import { Header } from "../../components";

type TransactionDetailNav = NativeStackNavigationProp<RootStackParamList, "TransactionDetail">;
type TransactionDetailRoute = RouteProp<RootStackParamList, "TransactionDetail">;

const getTransactionTypeLabel = (type: string, payoutSubtype?: string): string => {
  if (type === "PAYOUT") {
    if (payoutSubtype === "WITHDRAWAL_TO_BANK") {
      return "Retirada a banco";
    }
    if (payoutSubtype === "KIT_PAYMENT") {
      return "Pago de kit";
    }
    return "Pago";
  }
  const labels: Record<string, string> = {
    TOP_UP: "Ingreso de dinero",
    FEE: "Comisión",
    GUARANTEE_DEPOSIT: "Depósito de garantía",
    GUARANTEE_REFUND: "Devolución de garantía",
    REFUND: "Reembolso",
  };
  return labels[type] || type;
};

const getTransactionTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    TOP_UP: "add-circle",
    PAYOUT: "cart",
    FEE: "briefcase",
    GUARANTEE_DEPOSIT: "shield",
    GUARANTEE_REFUND: "shield-checkmark",
    REFUND: "return-down-back",
  };
  return icons[type] || "receipt";
};

const getTransactionTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    TOP_UP: "#2ECC71",
    PAYOUT: "#E74C3C",
    FEE: "#F39C12",
    GUARANTEE_DEPOSIT: "#3498DB",
    GUARANTEE_REFUND: "#2ECC71",
    REFUND: "#3498DB",
  };
  return colors[type] || Colors.textSecondary;
};

const formatAmount = (amount?: number) => {
  if (amount === undefined) return "0,00 €";
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const sign = isNegative ? "-" : "+";
  return `${sign} ${absAmount.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// Componente FadeInItem local
const FadeInItem = ({ children, delay }: { children: React.ReactNode; delay: number }) => {
  const [opacity, setOpacity] = useState(0);
  React.useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <View style={{ opacity }}>{children}</View>;
};

export default function TransactionDetailScreen() {
  const navigation = useNavigation<TransactionDetailNav>();
  const route = useRoute<TransactionDetailRoute>();
  const { transactionId, transactionType, transactionAmount } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactionDetails(transactionId, user.token);
      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los detalles");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransaction();
    }, [transactionId, user?.token])
  );

  const typeLabel = transaction?.payoutSubtype ? getTransactionTypeLabel(transaction.type, transaction.payoutSubtype) : getTransactionTypeLabel(transactionType, undefined);  const typeIcon = transaction?.type ? getTransactionTypeIcon(transaction.type) : getTransactionTypeIcon(transactionType);
  const typeColor = transaction?.type ? getTransactionTypeColor(transaction.type) : getTransactionTypeColor(transactionType);
  const isPayout = transaction?.type === "PAYOUT" || transactionType === "PAYOUT";
  const isTopUp = transaction?.type === "TOP_UP" || transactionType === "TOP_UP";

  const renderItemCard = (item: any, index: number) => (
    <View key={item.itemId} style={styles.itemCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetail}>
          {item.category || "Sin categoría"} · {item.ownerName || "Propietario desconocido"}
        </Text>
        <Text style={styles.itemDetail}>
          {item.quantity} × {item.pricePerMonth.toFixed(2)} €/mes
        </Text>
      </View>
      <Text style={styles.itemTotal}>{item.total.toFixed(2)} €</Text>
    </View>
  );

  const renderTopUpDetails = () => (
    <View style={styles.detailsCard}>
      <Text style={styles.detailsTitle}>Detalle del ingreso</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Cantidad ingresada</Text>
        <Text style={[styles.amountValue, { color: "#2ECC71" }]}>
          {formatAmount(transaction?.amount || transactionAmount)}
        </Text>
      </View>
      <View style={styles.dividerLight} />
      <View style={styles.infoRow}>
        <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
        <Text style={styles.infoText}>{formatDate(transaction?.createdAt)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="card" size={16} color={Colors.textSecondary} />
        <Text style={styles.infoText}>Método de pago: Stripe</Text>
      </View>
      {transaction?.details?.description && (
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{transaction.details.description}</Text>
        </View>
      )}
    </View>
  );

  const renderPayoutDetails = () => {
    const details = transaction?.details;
    if (!details) {
      return (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalle del pago</Text>
          <Text style={styles.noDetailsText}>No hay detalles adicionales disponibles</Text>
          <View style={styles.dividerLight} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total pagado</Text>
            <Text style={[styles.amountValue, { color: "#E74C3C" }]}>
              {formatAmount(transaction?.amount || transactionAmount)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Detalle del pago</Text>
        
        <TouchableOpacity
          style={styles.kitInfo}
          onPress={() => navigation.navigate("KitDetail", { kitId: details.kitId })}
        >
          <View style={styles.kitInfoLeft}>
            <Ionicons name="cube" size={20} color={Colors.primary} />
            <Text style={styles.kitName}>{details.kitName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.dividerLight} />

        <Text style={styles.sectionSubtitle}>Productos alquilados</Text>
        {details.items.map((item, index) => renderItemCard(item, index))}

        <View style={styles.dividerLight} />

        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>{details.subtotal.toFixed(2)} €</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Garantía (20%)</Text>
            <Text style={styles.breakdownValue}>{details.guarantee.toFixed(2)} €</Text>
          </View>
          
          {details.platformFee > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Comisión de plataforma</Text>
              <Text style={styles.breakdownValue}>{details.platformFee.toFixed(2)} €</Text>
            </View>
          )}
          
          {details.courierFee > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Envío</Text>
              <Text style={styles.breakdownValue}>{details.courierFee.toFixed(2)} €</Text>
            </View>
          )}
          
          {details.discount > 0 && (
            <View style={[styles.breakdownRow, styles.discountRow]}>
              <Text style={[styles.breakdownLabel, { color: "#2ECC71" }]}>Descuento</Text>
              <Text style={[styles.breakdownValue, { color: "#2ECC71" }]}>-{details.discount.toFixed(2)} €</Text>
            </View>
          )}
          
          <View style={styles.breakdownTotalRow}>
            <Text style={styles.breakdownTotalLabel}>Total</Text>
            <Text style={styles.breakdownTotalValue}>{details.total.toFixed(2)} €</Text>
          </View>
        </View>

        <View style={styles.dividerLight} />

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{formatDate(transaction?.createdAt)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Header title="Detalle" showBack={true} onBack={navigation.goBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Header title="Detalle" showBack={true} onBack={navigation.goBack} />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTransaction}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header title="Detalle de transacción" showBack={true} onBack={navigation.goBack} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <FadeInItem delay={50}>
          <View style={styles.headerCard}>
            <View style={[styles.iconContainer, { backgroundColor: typeColor + "20" }]}>
              <Ionicons name={typeIcon} size={32} color={typeColor} />
            </View>
            <Text style={styles.headerType}>{typeLabel}</Text>
            <Text style={[styles.headerAmount, { color: isPayout ? "#E74C3C" : "#2ECC71" }]}>
              {formatAmount(transaction?.amount || transactionAmount)}
            </Text>
          </View>
        </FadeInItem>

        <FadeInItem delay={150}>
          {isTopUp ? renderTopUpDetails() : isPayout ? renderPayoutDetails() : (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Detalle de la transacción</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Cantidad</Text>
                <Text style={styles.amountValue}>{formatAmount(transaction?.amount || transactionAmount)}</Text>
              </View>
              <View style={styles.dividerLight} />
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{formatDate(transaction?.createdAt)}</Text>
              </View>
            </View>
          )}
        </FadeInItem>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: FontSizes.base,
    color: Colors.error,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.textWhite,
    fontWeight: FontWeights.semibold as "600",
  },
  headerCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerType: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  headerAmount: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold as "700",
    marginBottom: Spacing.md,
  },
  idContainer: {
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  idText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  kitInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  kitInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  kitName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textPrimary,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as "600",
    color: Colors.textPrimary,
  },
  itemDetail: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  itemTotal: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold as "700",
    color: Colors.primary,
  },
  breakdownContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as "500",
    color: Colors.textPrimary,
  },
  discountRow: {
    backgroundColor: "#E8F8F5",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  breakdownTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  breakdownTotalLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold as "700",
    color: Colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as "700",
    color: Colors.primary,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  amountValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as "700",
  },
  dividerLight: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  noDetailsText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
});