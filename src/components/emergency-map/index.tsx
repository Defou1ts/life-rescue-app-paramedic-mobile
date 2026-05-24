import { useParamedicsNearby } from "@/api/hooks/useParamedicsNeaby";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const USE_MOCK_LOCATION = false;

const MOCK_LOCATION = {
  latitude: 53.9023,
  longitude: 27.5619,
};

type Coords = {
  latitude: number;
  longitude: number;
};

export const EmergencyMap = () => {
  const webViewRef = useRef<WebView>(null);

  const {
    mutate: fetchParamedics,
    data: medics,
    isPending,
  } = useParamedicsNearby();

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      let coords: Coords;

      /**
       * =========================
       * GEOLOCATION INITIALIZATION
       * =========================
       */

      if (USE_MOCK_LOCATION) {
        coords = MOCK_LOCATION;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          // fallback если юзер запретил геолокацию
          coords = MOCK_LOCATION;
        } else {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      }

      setUserLocation(coords);

      /**
       * =========================
       * FETCH PARAMEDICS
       * =========================
       */

      fetchParamedics({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (e) {
      // fallback на Минск при любой ошибке
      setUserLocation(MOCK_LOCATION);

      fetchParamedics({
        latitude: MOCK_LOCATION.latitude,
        longitude: MOCK_LOCATION.longitude,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================
   * LOADING STATE
   * =========================
   */

  if (loading || isPending || !userLocation || !medics) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /**
   * =========================
   * MAP MARKERS (JS INJECTION)
   * =========================
   */

  const markersJS = medics
    .map(
      (medic) => `
        L.marker([${medic.latitude}, ${medic.longitude}])
          .addTo(map)
          .bindPopup('Paramedic');
      `,
    )
    .join("\n");

  /**
   * =========================
   * HTML MAP (LEAFLET)
   * =========================
   */

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet/dist/leaflet.css"
        />

        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

        <script>
          const userLat = ${userLocation.latitude};
          const userLng = ${userLocation.longitude};

          const map = L.map('map',{
  zoomControl: false
}).setView(
            [userLat, userLng],
            14
          );

          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              attribution: '© OpenStreetMap contributors'
            }
          ).addTo(map);

          /**
           * USER MARKER
           */
          const userMarker = L.marker([userLat, userLng])
            .addTo(map)
            .bindPopup('You')
            .openPopup();

          /**
           * PARAMEDICS
           */
          ${markersJS}
        </script>
      </body>
    </html>
  `;

  /**
   * =========================
   * RENDER
   * =========================
   */

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 188,
    borderRadius: 24,
    overflow: "hidden",
  },

  map: {
    flex: 1,
  },

  loader: {
    width: 250,
    height: 188,
    justifyContent: "center",
    alignItems: "center",
  },
});
