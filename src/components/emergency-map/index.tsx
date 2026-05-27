// src/components/emergency-map.tsx

import { useEffect, useMemo, useRef, useState } from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  userLocation: Coordinates | null;

  patientLocation: Coordinates | null;
};

type RouteCoordinates = [number, number][];

export const EmergencyMap = ({
  userLocation,

  patientLocation,
}: Props) => {
  const webViewRef = useRef<WebView>(null);

  const [route, setRoute] = useState<RouteCoordinates>([]);

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  /**
   * =========================
   * FETCH REAL ROUTE (OSRM)
   * =========================
   */

  useEffect(() => {
    if (!userLocation || !patientLocation) {
      setRoute([]);

      return;
    }

    fetchRoute();
  }, [userLocation, patientLocation]);

  const fetchRoute = async () => {
    if (!userLocation || !patientLocation) {
      return;
    }

    try {
      setIsLoadingRoute(true);

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userLocation.longitude},${userLocation.latitude};` +
        `${patientLocation.longitude},${patientLocation.latitude}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);

      const data = await response.json();

      const coordinates = data?.routes?.[0]?.geometry?.coordinates;

      if (!coordinates) {
        return;
      }

      setRoute(coordinates);
    } catch (error) {
      console.log("ROUTE_ERROR", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  /**
   * =========================
   * ETA
   * =========================
   */

  const eta = useMemo(() => {
    if (!route.length) {
      return null;
    }

    let totalDistanceKm = 0;

    for (let i = 1; i < route.length; i++) {
      const [lng1, lat1] = route[i - 1];

      const [lng2, lat2] = route[i];

      totalDistanceKm += haversineDistance(lat1, lng1, lat2, lng2);
    }

    /**
     * average ambulance speed
     */
    const averageSpeed = 45;

    const minutes = Math.max(
      1,
      Math.round((totalDistanceKm / averageSpeed) * 60),
    );

    return `${minutes}-${minutes + 3} min`;
  }, [route]);

  /**
   * =========================
   * LOADING
   * =========================
   */

  if (!userLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /**
   * =========================
   * ROUTE JS
   * =========================
   */

  const routeJS = route.length
    ? `
      const routeCoordinates = ${JSON.stringify(
        route.map(([lng, lat]) => [lat, lng]),
      )};

      const routeLine = L.polyline(
        routeCoordinates,
        {
          color: '#0D9488',
          weight: 6,
          opacity: 0.9
        }
      ).addTo(map);

      map.fitBounds(
        routeLine.getBounds(),
        {
          padding: [50, 50]
        }
      );
    `
    : "";

  /**
   * =========================
   * PATIENT MARKER
   * =========================
   */

  const patientJS = patientLocation
    ? `
      const patientMarker = L.marker(
        [
          ${patientLocation.latitude},
          ${patientLocation.longitude}
        ]
      )
      .addTo(map)
      .bindPopup('Patient');
    `
    : "";

  /**
   * =========================
   * MAP HTML
   * =========================
   */

  const html = `
    <!DOCTYPE html>

    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet/dist/leaflet.css"
        />

        <style>
          html,
          body,
          #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }

          .leaflet-control-attribution {
            display: none;
          }

          .leaflet-control-zoom {
            display: none;
          }

          body {
            background: #FFFFFF;
          }
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

        <script>
          const map = L.map(
            'map',
            {
              zoomControl: false
            }
          );

          /**
           * =========================
           * TILES
           * =========================
           */

          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 19
            }
          ).addTo(map);

          /**
           * =========================
           * USER
           * =========================
           */

          const userMarker = L.marker(
            [
              ${userLocation.latitude},
              ${userLocation.longitude}
            ]
          )
          .addTo(map)
          .bindPopup('You');

          /**
           * =========================
           * DEFAULT VIEW
           * =========================
           */

          map.setView(
            [
              ${userLocation.latitude},
              ${userLocation.longitude}
            ],
            14
          );

          /**
           * =========================
           * PATIENT
           * =========================
           */

          ${patientJS}

          /**
           * =========================
           * ROUTE
           * =========================
           */

          ${routeJS}
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
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          mixedContentMode="always"
          style={styles.map}
        />
      </View>

      {!!eta && (
        <View style={styles.etaContainer}>
          <View style={styles.etaDot} />

          <View>
            <View>
              <Text style={styles.etaTitle}>Estimated Arrival</Text>

              <Text style={styles.etaText}>{eta}</Text>
            </View>
          </View>
        </View>
      )}

      {isLoadingRoute && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      )}
    </View>
  );
};

/**
 * =========================
 * HAVERSINE DISTANCE
 * =========================
 */

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 500,
  },

  container: {
    flex: 1,

    borderRadius: 28,

    overflow: "hidden",

    backgroundColor: "#F3F4F6",
  },

  map: {
    flex: 1,

    backgroundColor: "transparent",
  },

  loader: {
    width: "100%",
    height: 500,

    justifyContent: "center",
    alignItems: "center",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.35)",
  },

  etaContainer: {
    position: "absolute",

    bottom: 18,

    alignSelf: "center",

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 999,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,

    shadowRadius: 12,

    elevation: 8,
  },

  etaDot: {
    width: 12,

    height: 12,

    borderRadius: 999,

    backgroundColor: "#22C55E",
  },

  etaTitle: {
    fontSize: 12,

    color: "#6B7280",

    fontWeight: "500",
  },

  etaText: {
    fontSize: 16,

    color: "#111827",

    fontWeight: "700",
  },
});
