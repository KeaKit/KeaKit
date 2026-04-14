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

  // Filtrar artículos con coordenadas
  const articlesWithCoords = useMemo(
    () => articles.filter((a) => a.cityLat !== undefined && a.cityLng !== undefined),
    [articles],
  );

  // Agrupar artículos por ciudad (nombre de ciudad)
  const groupedMarkers = useMemo(() => {
    const groups: Map<string, MapArticle[]> = new Map();

    for (const article of articlesWithCoords) {
      const cityKey = (article.city || "unknown").trim().toLowerCase();
      if (!groups.has(cityKey)) {
        groups.set(cityKey, []);
      }
      groups.get(cityKey)!.push(article);
    }

    const result: {
      id?: number | null;
      lat: number;
      lng: number;
      title: string;
      sub: string;
      price?: string;
      owner?: string;
      isTarget: boolean;
      count: number;
      articles: MapArticle[];
    }[] = [];

    for (const [cityKey, groupArticles] of groups.entries()) {
      const firstArticle = groupArticles[0];
      const cityName = groupArticles[0].city || cityKey;
      
      if (groupArticles.length === 1) {
        const a = groupArticles[0];
        result.push({
          id: a.id,
          lat: a.cityLat!,
          lng: a.cityLng!,
          title: a.title,
          sub: `${cityName}${a.distanceKm ? ` · ~${a.distanceKm} km` : ""}`,
          price: `${a.pricePerMonth.toFixed(2)} €/mes`,
          owner: a.ownerName,
          isTarget: false,
          count: 1,
          articles: groupArticles,
        });
      } else {
        const minPrice = Math.min(...groupArticles.map(a => a.pricePerMonth));
        const maxPrice = Math.max(...groupArticles.map(a => a.pricePerMonth));
        result.push({
          id: null,
          lat: firstArticle.cityLat!,
          lng: firstArticle.cityLng!,
          title: `📦 ${groupArticles.length} artículos en ${cityName}`,
          sub: `${groupArticles.length} productos disponibles`,
          price: minPrice === maxPrice 
            ? `${minPrice.toFixed(2)} €/mes`
            : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} €/mes`,
          owner: undefined,
          isTarget: false,
          count: groupArticles.length,
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
        sub: "Tu ubicación seleccionada",
        price: undefined,
        owner: undefined,
        isTarget: true,
        count: 1,
        articles: [],
      });
    }

    return result;
  }, [articlesWithCoords, targetCityCoords, userCity]);

  const centerLat = targetCityCoords?.lat ?? groupedMarkers[0]?.lat ?? 40.416;
  const centerLng = targetCityCoords?.lng ?? groupedMarkers[0]?.lng ?? -3.703;

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

  // Sync selection state into iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SELECTION_UPDATE", ids: selectedIds },
      "*"
    );
  }, [selectedIds]);

  const markersJson = JSON.stringify(groupedMarkers);
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
    .popup-sub { font-size: 11px; color: #666; margin-bottom: 4px; }
    .popup-price { font-size: 12px; font-weight: 600; color: ${primaryColor}; margin-top: 2px; }
    .popup-owner { font-size: 11px; color: #888; margin-bottom: 6px; }
    .popup-divider { height: 1px; background: #eee; margin: 8px 0; }
    .article-list { max-height: 250px; overflow-y: auto; margin-top: 4px; }
    .article-item { 
      padding: 8px 0; 
      border-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .article-item:first-child { border-top: none; }
    .article-title { font-weight: 500; flex: 1; font-size: 12px; }
    .article-price { color: ${primaryColor}; font-weight: 600; font-size: 11px; white-space: nowrap; }
    .btn-add {
      padding: 4px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .btn-add.selected { background: #eee; color: #555; }
    .btn-add.unselected { background: ${primaryColor}; color: white; }
    .cluster-marker {
      background: ${primaryColor};
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
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .single-marker {
      background: #F57F17;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      cursor: pointer;
    }
    .target-marker {
      background: ${primaryColor};
      border-radius: 50%;
      width: 14px;
      height: 14px;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var selected = new Set(${initialSelectedJson});
    var map = L.map('map').setView([${centerLat}, ${centerLng}], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var markersData = ${markersJson};

    function sendAddArticle(id) {
      parent.postMessage({ type: 'ADD_ARTICLE', id: id }, '*');
    }

    function buildPopup(m) {
      var html = '<div class="popup-title">' + m.title + '</div>';
      if (m.sub) html += '<div class="popup-sub">' + m.sub + '</div>';
      if (m.price) html += '<div class="popup-price">' + m.price + '</div>';
      if (m.owner) html += '<div class="popup-owner">' + m.owner + '</div>';
      
      // Si es un cluster con múltiples artículos
      if (!m.isTarget && m.count > 1 && m.articles && m.articles.length > 0) {
        html += '<div class="popup-divider"></div>';
        html += '<div class="article-list">';
        for (var i = 0; i < m.articles.length; i++) {
          var a = m.articles[i];
          var isSel = selected.has(a.id);
          html += '<div class="article-item">';
          html += '<span class="article-title">' + a.title + '</span>';
          html += '<span class="article-price">' + a.pricePerMonth.toFixed(2) + '€/mes</span>';
          html += '<button class="btn-add ' + (isSel ? 'selected' : 'unselected') + '" onclick="sendAddArticle(' + a.id + ')">'
                + (isSel ? 'Quitar' : 'Añadir') + '</button>';
          html += '</div>';
        }
        html += '</div>';
      } 
      // Si es un artículo individual
      else if (!m.isTarget && m.id != null) {
        var isSel = selected.has(m.id);
        html += '<div class="popup-divider"></div>';
        html += '<button class="btn-add ' + (isSel ? 'selected' : 'unselected') + '" style="width:100%; margin-top:6px;" onclick="sendAddArticle(' + m.id + ')">'
              + (isSel ? 'Quitar del kit' : 'Añadir al kit') + '</button>';
      }
      
      return html;
    }

    function getIcon(m) {
      if (m.isTarget) {
        return L.divIcon({
          html: '<div class="target-marker"></div>',
          className: '', iconSize: [14, 14], iconAnchor: [7, 7]
        });
      } else if (m.count > 1) {
        return L.divIcon({
          html: '<div class="cluster-marker">' + m.count + '</div>',
          className: '', iconSize: [36, 36], iconAnchor: [18, 18]
        });
      } else {
        return L.divIcon({
          html: '<div class="single-marker"></div>',
          className: '', iconSize: [14, 14], iconAnchor: [7, 7]
        });
      }
    }

    var leafletMarkers = {};
    markersData.forEach(function(m) {
      var icon = getIcon(m);
      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
      marker.bindPopup(buildPopup(m));
      
      if (!m.isTarget && m.count === 1 && m.id != null) {
        leafletMarkers[m.id] = { marker: marker, data: m };
      }
      if (!m.isTarget && m.count > 1 && m.articles) {
        for (var i = 0; i < m.articles.length; i++) {
          leafletMarkers[m.articles[i].id] = { marker: marker, data: m };
        }
      }
    });

    window.addEventListener('message', function(e) {
      try {
        var msg = e.data;
        if (msg && msg.type === 'SELECTION_UPDATE') {
          selected = new Set(msg.ids);
          Object.keys(leafletMarkers).forEach(function(id) {
            var entry = leafletMarkers[id];
            if (entry && entry.marker) {
              entry.marker.setPopupContent(buildPopup(entry.data));
            }
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