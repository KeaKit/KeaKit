import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { Colors } from "../styles";

type MapArticle = {
  id: number;
  title: string;
  city?: string;
  pricePerMonth: number;
  ownerName?: string;
  distanceKm?: number;
  cityLat?: number;
  cityLng?: number;
};

type ArticleMapViewProps = {
  articles: MapArticle[];
  targetCityCoords: { lat: number; lng: number } | null;
  userCity?: string;
};

export const ArticleMapView: React.FC<ArticleMapViewProps> = ({
  articles,
  targetCityCoords,
  userCity,
}) => {
  const nearbyArticles = useMemo(
    () => articles.filter((a) => a.cityLat !== undefined && a.cityLng !== undefined),
    [articles],
  );

  const centerLat = targetCityCoords?.lat ?? nearbyArticles[0]?.cityLat ?? 40.416;
  const centerLng = targetCityCoords?.lng ?? nearbyArticles[0]?.cityLng ?? -3.703;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: 3.0,
        longitudeDelta: 3.0,
      }}
    >
      {targetCityCoords && (
        <Marker
          coordinate={{ latitude: targetCityCoords.lat, longitude: targetCityCoords.lng }}
          pinColor={Colors.primary}
        >
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{userCity ?? "Ciudad destino"}</Text>
              <Text style={styles.calloutSub}>Tu ciudad seleccionada</Text>
            </View>
          </Callout>
        </Marker>
      )}

      {nearbyArticles.map((article) => (
        <Marker
          key={article.id}
          coordinate={{
            latitude: article.cityLat!,
            longitude: article.cityLng!,
          }}
          pinColor="#F57F17"
        >
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={styles.calloutSub}>
                {article.city}
                {article.distanceKm !== undefined ? ` · ~${article.distanceKm} km` : ""}
              </Text>
              <Text style={styles.calloutPrice}>
                {article.pricePerMonth.toFixed(2)} €/mes
              </Text>
              {article.ownerName ? (
                <Text style={styles.calloutOwner}>{article.ownerName}</Text>
              ) : null}
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  callout: {
    width: 180,
    padding: 6,
    gap: 2,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  calloutSub: {
    fontSize: 12,
    color: "#555",
  },
  calloutPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },
  calloutOwner: {
    fontSize: 11,
    color: "#888",
  },
});
