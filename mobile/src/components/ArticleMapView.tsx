import React, { useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
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
  selectedIds?: number[];
  onAddArticle?: (id: number) => void;
};

export const ArticleMapView: React.FC<ArticleMapViewProps> = ({
  articles,
  targetCityCoords,
  userCity,
  selectedIds = [],
  onAddArticle,
}) => {
  const webViewRef = useRef<WebView>(null);

  // DEBUG: Ver qué llega
  console.log("🔴 ArticleMapView - artículos:", articles.length);
  
  // Agrupar por nombre de ciudad
  const groupedArticles = useMemo(() => {
    console.log("🟡 Agrupando artículos...");
    const groups: Map<string, MapArticle[]> = new Map();

    for (const article of articles) {
      if (article.cityLat === undefined || article.cityLng === undefined) {
        console.log(`  ❌ ${article.title} - sin coordenadas`);
        continue;
      }
      const cityKey = (article.city || "unknown").trim().toLowerCase();
      console.log(`  ✅ ${article.title} -> ciudad: "${cityKey}"`);
      if (!groups.has(cityKey)) {
        groups.set(cityKey, []);
      }
      groups.get(cityKey)!.push(article);
    }

    console.log(`📊 Total grupos: ${groups.size}`);
    const result: any[] = [];

    for (const [cityKey, groupArticles] of groups.entries()) {
      const firstArticle = groupArticles[0];
      console.log(`  Grupo "${cityKey}": ${groupArticles.length} artículos`);
      
      if (groupArticles.length === 1) {
        const a = groupArticles[0];
        result.push({
          id: a.id,
          lat: a.cityLat,
          lng: a.cityLng,
          title: a.title,
          sub: `${a.city || cityKey}`,
          price: `${a.pricePerMonth.toFixed(2)} €/mes`,
          owner: a.ownerName,
          isTarget: false,
          count: 1,
          articleIds: [a.id],
          articles: groupArticles,
        });
      } else {
        result.push({
          id: null,
          lat: firstArticle.cityLat,
          lng: firstArticle.cityLng,
          title: `📦 ${groupArticles.length} artículos en ${groupArticles[0].city || cityKey}`,
          sub: `${groupArticles.length} productos`,
          price: `Desde ${Math.min(...groupArticles.map(a => a.pricePerMonth)).toFixed(2)} €/mes`,
          owner: undefined,
          isTarget: false,
          count: groupArticles.length,
          articleIds: groupArticles.map(a => a.id),
          articles: groupArticles,
        });
      }
    }

    if (targetCityCoords) {
      result.push({
        id: null,
        lat: targetCityCoords.lat,
        lng: targetCityCoords.lng,
        title: "📍 " + (userCity ?? "Ciudad destino"),
        sub: "Tu ubicación",
        price: undefined,
        owner: undefined,
        isTarget: true,
        count: 1,
        articleIds: [],
        articles: [],
      });
    }

    console.log("✅ Marcadores finales:", result.length);
    return result;
  }, [articles, targetCityCoords, userCity]);

  const centerLat = targetCityCoords?.lat ?? groupedArticles[0]?.lat ?? 40.416;
  const centerLng = targetCityCoords?.lng ?? groupedArticles[0]?.lng ?? -3.703;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
    .popup-title { font-weight: 700; font-size: 14px; }
    .popup-sub { font-size: 11px; color: #666; }
    .popup-price { font-size: 13px; font-weight: 600; color: ${Colors.primary}; margin-top: 4px; }
    .cluster-marker {
      background: ${Colors.primary};
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      border: 2px solid white;
      cursor: pointer;
    }
    .single-marker {
      background: #F57F17;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      border: 2px solid white;
      cursor: pointer;
    }
    .btn-add {
      margin-top: 8px;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .btn-add.selected { background: #eee; color: #555; }
    .btn-add.unselected { background: ${Colors.primary}; color: white; }
    .article-list { margin-top: 8px; border-top: 1px solid #eee; }
    .article-item { padding: 6px 0; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; }
    .article-item:first-child { border-top: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var selected = new Set(${JSON.stringify(selectedIds)});
    var map = L.map('map').setView([${centerLat}, ${centerLng}], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var markersData = ${JSON.stringify(groupedArticles)};
    console.log("Mapa - Marcadores a dibujar:", markersData.length);

    function sendAddArticle(id) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ADD_ARTICLE', id: id }));
    }

    function buildPopup(m) {
      var html = '<b>' + m.title + '</b>';
      if (m.sub) html += '<div class="popup-sub">' + m.sub + '</div>';
      if (m.price) html += '<div class="popup-price">' + m.price + '</div>';
      
      if (!m.isTarget && m.count > 1 && m.articles) {
        html += '<div class="article-list">';
        for (var i = 0; i < m.articles.length; i++) {
          var a = m.articles[i];
          var isSel = selected.has(a.id);
          html += '<div class="article-item">';
          html += '<span>' + a.title + ' (' + a.pricePerMonth.toFixed(2) + '€/mes)</span>';
          html += '<button class="btn-add ' + (isSel ? 'selected' : 'unselected') + '" onclick="sendAddArticle(' + a.id + ')">' + (isSel ? 'Quitar' : 'Añadir') + '</button>';
          html += '</div>';
        }
        html += '</div>';
      } else if (!m.isTarget && m.id != null) {
        var isSel = selected.has(m.id);
        html += '<button class="btn-add ' + (isSel ? 'selected' : 'unselected') + '" style="width:100%; margin-top:8px;" onclick="sendAddArticle(' + m.id + ')">' + (isSel ? 'Quitar del kit' : 'Añadir al kit') + '</button>';
      }
      return html;
    }

    function getIcon(m) {
      if (m.isTarget) {
        return L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#${Colors.primary.replace('#', '')};border:2px solid white;"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      } else if (m.count > 1) {
        return L.divIcon({ html: '<div class="cluster-marker">' + m.count + '</div>', iconSize: [36, 36], iconAnchor: [18, 18] });
      } else {
        return L.divIcon({ html: '<div class="single-marker"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      }
    }

    markersData.forEach(function(m) {
      var marker = L.marker([m.lat, m.lng], { icon: getIcon(m) }).addTo(map);
      marker.bindPopup(buildPopup(m));
    });
  </script>
</body>
</html>`;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "ADD_ARTICLE" && onAddArticle) {
        onAddArticle(msg.id);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        originWhitelist={["*"]}
        javaScriptEnabled
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});