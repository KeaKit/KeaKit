import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../styles';

interface Props {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  action?: { label: string; onPress: () => void };
  duration?: number;
}

export const PushNotification: React.FC<Props> = ({
  visible,
  message,
  type = 'success',
  onClose,
  action,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onClose());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return Colors.success;
      case 'error': return Colors.error;
      case 'info': return Colors.info || '#2196F3';
      default: return Colors.success;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity
          onPress={() => {
            action.onPress();
            onClose();
          }}
        >
          <Text style={styles.action}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  action: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 16,
    textDecorationLine: 'underline',
  },
});