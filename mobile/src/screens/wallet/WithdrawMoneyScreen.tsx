import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { Header, KeakitButton, KeakitModal } from "../../components";
import { useAuth } from "../../context/AuthContext";
import {
  getLoggedUserWallet,
  withdrawFromLoggedUserWallet,
} from "../../services/walletService";
import { Colors, commonStyles } from "../../styles";
import { RootStackParamList } from "../../types";

type WithdrawNav = NativeStackNavigationProp<
  RootStackParamList,
  "WithdrawMoney"
>;

type FormErrors = {
  bankAccount?: string;
  amount?: string;
  general?: string;
};

const IBAN_REGEX = /^[A-Z]{2}[0-9A-Z]{13,32}$/;

export default function WithdrawMoneyScreen() {
  const navigation = useNavigation<WithdrawNav>();
  const { user } = useAuth();

  const [bankAccount, setBankAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.token) {
        return;
      }

      try {
        const wallet = await getLoggedUserWallet(user.token);
        setAvailableBalance(wallet.balance);
      } catch {
        setAvailableBalance(null);
      }
    };

    fetchBalance();
  }, [user?.token]);

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(",", ".").trim();
    if (!normalized) {
      return null;
    }
    const value = Number.parseFloat(normalized);
    return Number.isNaN(value) ? null : value;
  }, [amount]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const normalizedAccount = bankAccount.replace(/\s+/g, "").toUpperCase();

    if (!normalizedAccount) {
      nextErrors.bankAccount = "La cuenta bancaria es obligatoria.";
    } else if (!IBAN_REGEX.test(normalizedAccount)) {
      nextErrors.bankAccount = "Introduce una cuenta valida (formato IBAN).";
    }

    if (!amount.trim()) {
      nextErrors.amount = "La cantidad es obligatoria.";
    } else if (parsedAmount === null) {
      nextErrors.amount = "Introduce una cantidad valida.";
    } else if (parsedAmount <= 0) {
      nextErrors.amount = "La cantidad debe ser mayor que 0.";
    } else if (availableBalance !== null && parsedAmount > availableBalance) {
      nextErrors.amount = "No puedes retirar mas dinero del saldo disponible.";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || parsedAmount === null) {
      return;
    }

    if (!user?.token) {
      setErrors({ general: "Necesitas iniciar sesion para retirar dinero." });
      return;
    }

    try {
      setSubmitting(true);
      await withdrawFromLoggedUserWallet(user.token, {
        bankAccount: bankAccount.replace(/\s+/g, "").toUpperCase(),
        amount: parsedAmount,
      });
      setInfoModalVisible(true);
    } catch (submitError) {
      setErrors({
        general:
          submitError instanceof Error
            ? submitError.message
            : "No se pudo procesar la retirada.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header
        title="Retirar dinero"
        showBack={true}
        onBack={navigation.goBack}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={commonStyles.subtitle}>Formulario de retirada</Text>
            <Text style={commonStyles.caption}>
              Introduce tu cuenta bancaria y la cantidad que quieres retirar.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cuenta bancaria (IBAN)</Text>
              <TextInput
                style={[
                  commonStyles.input,
                  errors.bankAccount ? commonStyles.inputError : null,
                ]}
                placeholder="ES12..."
                autoCapitalize="characters"
                value={bankAccount}
                onChangeText={(text) => {
                  setBankAccount(text);
                  setErrors((prev) => ({
                    ...prev,
                    bankAccount: undefined,
                    general: undefined,
                  }));
                }}
              />
              {errors.bankAccount ? (
                <Text style={commonStyles.errorText}>{errors.bankAccount}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cantidad (EUR)</Text>
              <TextInput
                style={[
                  commonStyles.input,
                  errors.amount ? commonStyles.inputError : null,
                ]}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setErrors((prev) => ({
                    ...prev,
                    amount: undefined,
                    general: undefined,
                  }));
                }}
              />
              {availableBalance !== null ? (
                <Text style={styles.balanceText}>
                  Saldo disponible:{" "}
                  {availableBalance.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  EUR
                </Text>
              ) : null}
              {errors.amount ? (
                <Text style={commonStyles.errorText}>{errors.amount}</Text>
              ) : null}
            </View>

            {errors.general ? (
              <Text style={commonStyles.errorText}>{errors.general}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={commonStyles.footerContainer}>
        <KeakitButton
          title={submitting ? "Procesando retirada..." : "Enviar retirada"}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        />
      </View>

      <KeakitModal
        visible={infoModalVisible}
        onDismiss={() => {
          setInfoModalVisible(false);
          navigation.goBack();
        }}
        message="La retirada se ha procesado correctamente."
        variant="info"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    backgroundColor: Colors.backgroundGray,
    flexGrow: 1,
  },
  formCard: {
    ...commonStyles.card,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    ...commonStyles.body,
    fontWeight: "700",
  },
  balanceText: {
    ...commonStyles.caption,
    marginTop: 2,
  },
});
