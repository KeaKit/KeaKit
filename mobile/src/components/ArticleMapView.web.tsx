import React, { useMemo } from "react";
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

  const markers = useMemo(() => {
    const result: {
      lat: number;
      lng: number;
      title: string;
      sub: string;
      price?: string;
      owner?: string;
      isTarget: boolean;
    }[] = [];

    if (targetCityCoords) {
      result.push({
        lat: targetCityCoords.lat,
        lng: targetCityCoords.lng,
        title: userCity ?? "Ciudad destino",
        sub: "Tu ciudad seleccionada",
        isTarget: true,
      });
    }

    for (const a of nearbyArticles) {
      result.push({
        lat: a.cityLat!,
        lng: a.cityLng!,
        title: a.title,
        sub: `${a.city ?? ""}${a.distanceKm !== undefined ? ` · ~${a.distanceKm} km` : ""}`,
        price: `${a.pricePerMonth.toFixed(2)} €/mes`,
        owner: a.ownerName,
        isTarget: false,
      });
    }

    return result;
  }, [nearbyArticles, targetCityCoords, userCity]);

  const markersJson = JSON.stringify(markers);
  const primaryColor = Colors.primary;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
    .popup-title { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 2px; }
    .popup-sub { font-size: 12px; color: #555; }
    .popup-price { font-size: 13px; font-weight: 600; color: ${primaryColor}; margin-top: 2px; }
    .popup-owner { font-size: 11px; color: #888; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLng}], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var markers = ${markersJson};

    markers.forEach(function(m) {
      var color = m.isTarget ? '${primaryColor}' : '#F57F17';
      var icon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>',
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      var popup = '<div class="popup-title">' + m.title + '</div>';
      if (m.sub) popup += '<div class="popup-sub">' + m.sub + '</div>';
      if (m.price) popup += '<div class="popup-price">' + m.price + '</div>';
      if (m.owner) popup += '<div class="popup-owner">' + m.owner + '</div>';
      L.marker([m.lat, m.lng], { icon: icon }).addTo(map).bindPopup(popup);
    });
  </script>
</body>
</html>`;

  return (
    <div
      style={{
        height: 300,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <iframe
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Mapa de artículos"
      />
    </div>
  );
};
