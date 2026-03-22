import React, { useRef, useEffect, useMemo } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const nearbyArticles = useMemo(
    () => articles.filter((a) => a.cityLat !== undefined && a.cityLng !== undefined),
    [articles],
  );

  const centerLat = targetCityCoords?.lat ?? nearbyArticles[0]?.cityLat ?? 40.416;
  const centerLng = targetCityCoords?.lng ?? nearbyArticles[0]?.cityLng ?? -3.703;

  const markers = useMemo(() => {
    const result: {
      id?: number;
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
        id: a.id,
        lat: a.cityLat!,
        lng: a.cityLng!,
        title: a.title,
        sub: `${a.city ?? ""}${a.distanceKm ? ` · ~${a.distanceKm} km` : ""}`,
        price: `${a.pricePerMonth.toFixed(2)} €/mes`,
        owner: a.ownerName,
        isTarget: false,
      });
    }

    return result;
  }, [nearbyArticles, targetCityCoords, userCity]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "ADD_ARTICLE" && onAddArticle) {
        onAddArticle(e.data.id);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onAddArticle]);

  // Sync selection state into iframe without re-rendering it
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SELECTION_UPDATE", ids: selectedIds },
      "*"
    );
  }, [selectedIds]);

  const markersJson = JSON.stringify(markers);
  const initialSelectedJson = JSON.stringify(selectedIds);
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
    .popup-owner { font-size: 11px; color: #888; margin-bottom: 6px; }
    .btn-add {
      margin-top: 6px; width: 100%; padding: 5px 0;
      border: none; border-radius: 6px; cursor: pointer;
      font-size: 13px; font-weight: 600;
    }
    .btn-add.selected { background: #eee; color: #555; }
    .btn-add.unselected { background: ${primaryColor}; color: white; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var selected = new Set(${initialSelectedJson});
    var map = L.map('map').setView([${centerLat}, ${centerLng}], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var markers = ${markersJson};

    function sendToggle(id) {
      parent.postMessage({ type: 'ADD_ARTICLE', id: id }, '*');
    }

    function buildPopup(m) {
      var html = '<div class="popup-title">' + m.title + '</div>';
      if (m.sub) html += '<div class="popup-sub">' + m.sub + '</div>';
      if (m.price) html += '<div class="popup-price">' + m.price + '</div>';
      if (m.owner) html += '<div class="popup-owner">' + m.owner + '</div>';
      if (!m.isTarget && m.id != null) {
        var isSel = selected.has(m.id);
        html += '<button class="btn-add ' + (isSel ? 'selected' : 'unselected') + '" onclick="sendToggle(' + m.id + ')">'
              + (isSel ? 'Quitar' : 'Añadir') + '</button>';
      }
      return html;
    }

    var leafletMarkers = {};
    markers.forEach(function(m) {
      var color = m.isTarget ? '${primaryColor}' : '#F57F17';
      var icon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>',
        className: '', iconSize: [14, 14], iconAnchor: [7, 7]
      });
      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
      marker.bindPopup(buildPopup(m));
      if (!m.isTarget && m.id != null) leafletMarkers[m.id] = { marker: marker, data: m };
    });

    window.addEventListener('message', function(e) {
      try {
        var msg = e.data;
        if (msg && msg.type === 'SELECTION_UPDATE') {
          selected = new Set(msg.ids);
          Object.keys(leafletMarkers).forEach(function(id) {
            var entry = leafletMarkers[id];
            entry.marker.setPopupContent(buildPopup(entry.data));
          });
        }
      } catch(err) {}
    });
  </script>
</body>
</html>`;

  return (
    <div style={{ height: 300, borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Mapa de artículos"
      />
    </div>
  );
};
