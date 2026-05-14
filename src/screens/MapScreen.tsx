import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const YANGON_LAT = 16.8409;
  const YANGON_LNG = 96.1235;

  const mapHtml = `
    <!DOCTYPE html>
    <html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>body{margin:0;padding:0}#map{width:100%;height:100vh}</style>
    </head><body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${YANGON_LAT}, ${YANGON_LNG}], 14);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Esri'
        }).addTo(map);
        L.marker([${YANGON_LAT}, ${YANGON_LNG}]).addTo(map).bindPopup('My Location').openPopup();
      </script>
    </body></html>
  `;

  return (
    <View style={s.container}>
      <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={s.map} javaScriptEnabled={true} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  map: { flex: 1 },
});
