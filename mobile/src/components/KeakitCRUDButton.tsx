import React, { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ViewStyle,
  StyleProp
} from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights } from "../styles/theme";
import { Icon } from "react-native-paper";

type ButtonVariant = "blue" | "violet" | "green" | "modalBlue";

type KeakitCRUDButtonProps = {
  onPress: () => void;
  type: "edit" | "delete";
  text?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export const KeakitCRUDButton = ({
  onPress,
  type,
  text = false,
  disabled = false,
  variant = "blue",
}: KeakitCRUDButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const animateScale = (toValue: number) => {
    Animated.timing(scaleValue, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    if (disabled) return styles.disabled;

    switch (variant) {
      case "violet":
        return styles.violet;
      case "green":
        return styles.green;
      case "modalBlue":
        return styles.modalBlue;
      default:
        return styles.blue;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;

    switch (variant) {
      case "violet":
        return styles.textViolet;
      case "green":
        return styles.textGreen;
      default:
        return styles.textBlue;
    }
  };

  const getTitle = () => {
    if (!text) return "";
    return type === "edit" ? "Editar" : "Eliminar";
  };

  const getIconName = () => {
    return type === "edit" ? "pencil" : "delete";
  };
  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleValue }] }]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onHoverIn={() => !disabled && (setIsHovered(true), animateScale(1.02))}
        onHoverOut={() => (setIsHovered(false), animateScale(1))}
        onPressIn={() => !disabled && animateScale(0.96)}
        onPressOut={() => !disabled && animateScale(isHovered ? 1.02 : 1)}
        style={({ pressed }): StyleProp<ViewStyle> => [
          styles.button,
          getVariantStyles(),
          !disabled && (isHovered || pressed) && styles.buttonActive,
          Platform.OS === "web" &&
            ({
              cursor: (disabled ? "not-allowed" : "pointer") as any,
              outlineStyle: "none",
              userSelect: "none",
              transition: "all 0.2s ease-in-out",
            } as any),
        ]}
      >
        <Icon source={getIconName()} size={20} color={getTextStyle().color} />
        {text && (
          <Text style={[styles.buttonText, getTextStyle()]}>{getTitle()}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 45,
    height: 45,
    borderRadius: BorderRadius.md,
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textWhite,
    ...Platform.select({ web: { userSelect: "none" } as any }),
  },
  // --- VARIANTES ---
  blue: { backgroundColor: Colors.primaryHome },
  violet: { backgroundColor: Colors.secondaryLavender },
  green: { backgroundColor: Colors.secondaryMint },
  disabled: { backgroundColor: Colors.primaryHomeOpacity, opacity: 0.6 },
  modalBlue: {
    backgroundColor: Colors.primaryHome,
    width: "40%",
    alignSelf: "center",
  },

  textDisabled: { color: Colors.textSecondary },
  textBlue: { color: Colors.textWhite },
  textViolet: { color: Colors.primaryHome },
  textGreen: { color: Colors.primaryHome },

  buttonActive: {
    ...Platform.select({
      web: { filter: "brightness(1.05) saturate(1.1)" },
      default: { opacity: 0.9 },
    }),
  },
  loaderContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
