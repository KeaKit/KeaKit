import React from "react";
import { Text, StyleSheet, View } from "react-native";

export const KeakitTag = ({ title, color }: { title: string; color: string }) => {
    return (
        <View style={[styles.tagContainer, { backgroundColor: color }]}>
            <Text style={styles.tagText}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tagContainer: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
})