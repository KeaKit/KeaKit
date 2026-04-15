import React from "react";
import { StyleSheet } from "react-native";
import { Searchbar, IconButton } from "react-native-paper";
import { Colors, BorderRadius, FontSizes } from "../styles/theme";

type KeakitSearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
};

export const KeakitSearchBar = ({
  placeholder = "Buscar...",
  value,
  onChange,
}: KeakitSearchBarProps) => {
  return (
    <Searchbar
      placeholder={placeholder}
      placeholderTextColor={Colors.textLight}
      onChangeText={onChange}
      value={value}
      inputStyle={styles.input}
      icon="magnify"
      iconColor={Colors.textSecondary}
      clearIcon={() => (
        <IconButton
          icon="close"
          iconColor={Colors.textSecondary}
          onPress={() => { onChange("") }}
          style={styles.clearIcon}
        />
      )}
      style={styles.searchBar}
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    fontSize: FontSizes.base,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  input: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  clearIcon: {
    flex: 1,
    height: "100%",
    margin: 0,
    padding: 0,
  },
});
