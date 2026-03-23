import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface SkeletonPulseProps {
  width?: number | string;
  height?: number;
  radius?: number;
  dark?: boolean;
}

export const SkeletonPulse: React.FC<SkeletonPulseProps> = ({
  width: w = "100%",
  height: h = 16,
  radius = 6,
  dark = false,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: w as any,
        height: h,
        borderRadius: radius,
        backgroundColor: dark ? "rgba(255,255,255,0.3)" : "#E5E7EB",
        opacity,
      }}
    />
  );
};
