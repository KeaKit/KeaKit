import React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../styles/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean; // Prop opcional
  onBack?: () => void; // Acción al pulsar atrás
}

export const Header = ({ title, showBack = false, onBack }: HeaderProps) => {
  return (
    <Appbar.Header style={styles.header}>
      {/* Si showBack es true, mostramos la acción de retroceso */}
      {showBack && (
        <Appbar.Action 
          icon={() => <Ionicons name="arrow-back" size={24} color={Colors.primaryHome} />} 
          onPress={onBack} 
          color={Colors.primaryHome} 
          style={styles.backButton}
        />
      )}

      <Appbar.Content 
        title={title} 
        titleStyle={styles.title} 
      />

      {/* Espaciador invisible para mantener el título centrado cuando hay flecha */}
      {showBack && <View style={{ width: 48 }} />}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    elevation: 0,
    ...Shadows.header,
    zIndex: 10,
    minHeight: 80,
  },
  backButton: {
    marginLeft: 10,
    width: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primaryHome,
    letterSpacing: -0.5,
    textAlign: 'center', 
    flex: 1,
    paddingVertical: 5,
  },
});