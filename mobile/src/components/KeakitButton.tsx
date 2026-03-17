import React, { useRef, useState } from "react";
import { Text, StyleSheet, Pressable, Animated, Platform, ViewStyle, StyleProp, View, ActivityIndicator } from "react-native";
import { Colors, FontSizes, FontWeights } from "../styles/theme";


type ButtonVariant = "blue" | "violet" | "green";

interface KeakitButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
}

export const KeakitButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "blue",
}: KeakitButtonProps) => {

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
      case "violet": return styles.violet;
      case "green": return styles.green;
      default: return styles.blue;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;

    switch (variant) {
      case "violet": return styles.textViolet;
      case "green": return styles.textGreen;
      default: return styles.textBlue;
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
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
          Platform.OS === 'web' && ({
            cursor: (disabled ? 'not-allowed' : 'pointer') as any,
            outlineStyle: 'none',
            userSelect: 'none',
            transition: 'all 0.2s ease-in-out',
          } as any),
        ]}
      >
        <Text style={[styles.buttonText,getTextStyle(), { opacity: loading ? 0 : 1 }]}>
          {title}
        </Text>
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={getTextStyle().color} size="small" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  buttonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textWhite,
    ...Platform.select({ web: { userSelect: 'none' } as any }),
  },
  // --- VARIANTES ---
  blue: { backgroundColor: Colors.primaryHome },
  violet: { backgroundColor: Colors.secondaryLavender },
  green: { backgroundColor: Colors.secondaryMint },
  disabled: { backgroundColor: Colors.primaryHomeOpacity, opacity: 0.6 },
  
  textDisabled: { color: Colors.textSecondary },
  textBlue: { color: Colors.textWhite },
  textViolet: { color: Colors.primaryHome },
  textGreen: { color: Colors.primaryHome },
  
  buttonActive: {
    ...Platform.select({
      web: { filter: 'brightness(1.05) saturate(1.1)' },
      default: { opacity: 0.9 }
    })
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});