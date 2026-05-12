import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Header, KeakitButton, KeakitModal } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { withdrawToBank } from "../../services/walletService";
import { RootStackParamList } from "../../types";
import { Colors, commonStyles, FontWeights, Spacing } from "../../styles";
import { Helmet } from 'react-helmet-async'; 


type WithdrawMoneyNav = NativeStackNavigationProp<
  RootStackParamList,
  "WithdrawMoney"
>;

type FormErrors = {
  bankAccount?: string;
  amount?: string;
};

const ibanPattern = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

const isValidIban = (iban: string): boolean => {
  const normalized = iban.replace(/\s+/g, "").toUpperCase();

  if (!ibanPattern.test(normalized)) {
    return false;
  }

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let remainder = 0;

  for (const char of rearranged) {
    const chunk = /[A-Z]/.test(char)
      ? (char.charCodeAt(0) - 55).toString()
      : char;

    for (const digit of chunk) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
};

export default function WithdrawMoneyScreen() {
  const navigation = useNavigation<WithdrawMoneyNav>();
  const { user } = useAuth();
  const [bankAccount, setBankAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizedBankAccount = useMemo(
    () => bankAccount.replace(/\s+/g, "").toUpperCase(),
    [bankAccount],
  );

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getFriendlyErrorMessage = (message: string) => {
    const normalizedMessage = message.trim();

    if (
      normalizedMessage.includes("Not enough balance") ||
      normalizedMessage.includes("Insufficient balance") ||
      normalizedMessage.includes("Required:") ||
      normalizedMessage.includes("Available:")
    ) {
      const requiredMatch = normalizedMessage.match(
        /Required:\s*([0-9]+(?:\.[0-9]+)?)/i,
      );
      const availableMatch = normalizedMessage.match(
        /Available:\s*([0-9]+(?:\.[0-9]+)?)/i,
      );

      const required = requiredMatch?.[1];
      const available = availableMatch?.[1];

      if (required && available) {
        return `No tienes saldo suficiente para realizar esta retirada. Intentas retirar ${required} EUR, pero solo tienes ${available} EUR disponibles.`;
      }

      return "No tienes saldo suficiente para realizar esta retirada.";
    }

    return normalizedMessage;
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const normalizedAmount = amount.replace(",", ".");
    const parsedAmount = Number(normalizedAmount);

    if (!normalizedBankAccount) {
      nextErrors.bankAccount = "Introduce una cuenta bancaria.";
    } else if (!isValidIban(normalizedBankAccount)) {
      nextErrors.bankAccount = "Introduce un IBAN valido.";
    }

    if (!amount.trim()) {
      nextErrors.amount = "Introduce una cantidad.";
    } else if (!/^\d+([.,]\d{1,2})?$/.test(amount.trim())) {
      nextErrors.amount = "La cantidad debe tener como maximo 2 decimales.";
    } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "La cantidad debe ser mayor que 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    if (!user?.token) {
      setErrorMessage("Debes iniciar sesion para retirar dinero.");
      return;
    }

    setSubmitting(true);
    try {
      await withdrawToBank(user.token, {
        bankAccount: normalizedBankAccount,
        amount: Number(amount.replace(",", ".")),
      });
      setSuccessMessage("Retirada procesada correctamente.");
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage((error as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.containerWhite}>
     <Helmet>
        <title>Retirar dinero| KeaKit</title>
        <meta name="description" content="Retira dinero de tu wallet introduciendo tu número de cuenta y la cantidad que deseas retirar."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>    
      <Header
        title="Retirar Dinero"
        showBack={true}
        onBack={navigation.goBack}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.description}>
            Introduce la cuenta bancaria y la cantidad que quieres retirar.
          </Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cuenta bancaria</Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.bankAccount && commonStyles.inputError,
              ]}
              value={bankAccount}
              onChangeText={(value) => {
                setBankAccount(value);
                clearError("bankAccount");
              }}
              placeholder="ES12 3456 7890 1234 5678 9012"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {!!errors.bankAccount && (
              <View style={commonStyles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.bankAccount}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.amount && commonStyles.inputError,
              ]}
              value={amount}
              onChangeText={(value) => {
                setAmount(value);
                clearError("amount");
              }}
              placeholder="0,00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad"
            />
            {!!errors.amount && (
              <View style={commonStyles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.amount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={commonStyles.footerContainer}>
        <KeakitButton
          title="Confirmar retirada"
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>

      <KeakitModal
        visible={!!errorMessage}
        onDismiss={() => setErrorMessage(null)}
        message={errorMessage ?? "Ha ocurrido un error."}
        variant="error"
      />
      <KeakitModal
        visible={!!successMessage}
        onDismiss={() => {
          setSuccessMessage(null);
          navigation.goBack();
        }}
        message={successMessage ?? "Operacion completada."}
        variant="info"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    padding: Spacing.lg,
  },
  card: {
    ...commonStyles.card,
    gap: Spacing.lg,
  },
  description: {
    ...commonStyles.bodySecondary,
    lineHeight: 22,
  },
  fieldContainer: {
    gap: Spacing.sm,
  },
  label: {
    ...commonStyles.body,
    fontWeight: FontWeights.bold,
  },
});
