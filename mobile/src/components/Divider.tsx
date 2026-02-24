import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DividerProps {
  color?: string;
}

export default function Divider({ color = '#103a57' }: DividerProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: color }]} />

      <View style={[styles.tick, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
  },
});