import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface FadeInItemProps {
  delay?: number;
  children: React.ReactNode;
}

export const FadeInItem: React.FC<FadeInItemProps> = ({
  delay = 0,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], width: "100%" }}>
      {children}
    </Animated.View>
  );
};
