import { useMemo } from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  userLocation: Coordinates | null;
  patientLocation: Coordinates | null;
  waitingForEmergency?: boolean;
  isLoading?: boolean;
};

/**
 * Round to N decimals so small GPS float jitter doesn't regenerate
 * the HTML string and cause a WebView reload every few seconds.
 * 5 decimals ≈ 1 m precision — plenty for emergency dispatch.
 */
const roundCoord = (v: number, decimals = 5) =>
  Math.round(v * 10 ** decimals) / 10 ** decimals;

export const EmergencyMap = ({
  userLocation,
  patientLocation,
  waitingForEmergency = false,
  isLoading = false,
}: Props) => {
  const normalizedUser = useMemo(() => {
    if (!userLocation) return null;
    return {
      latitude: roundCoord(userLocation.latitude),
      longitude: roundCoord(userLocation.longitude),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.latitude, userLocation?.longitude]);

  const normalizedPatient = useMemo(() => {
    if (!patientLocation) return null;
    return {
      latitude: roundCoord(patientLocation.latitude),
      longitude: roundCoord(patientLocation.longitude),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientLocation?.latitude, patientLocation?.longitude]);

  const estimatedArrival =
    normalizedUser && normalizedPatient
      ? calculateETA(normalizedUser, normalizedPatient)
      : null;

  const html = useMemo(() => {
    if (!normalizedUser) return null;

    const patientJS = normalizedPatient
      ? `
        L.marker([${normalizedPatient.latitude}, ${normalizedPatient.longitude}])
          .addTo(map)
          .bindPopup('Patient');

        var routeLine = L.polyline([
          [${normalizedUser.latitude}, ${normalizedUser.longitude}],
          [${normalizedPatient.latitude}, ${normalizedPatient.longitude}]
        ], { color: '#0D9488', weight: 5, opacity: 0.9 }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      `
      : "";

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      .leaflet-control-attribution { display: none; }
      .leaflet-control-zoom { display: none; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      var map = L.map('map', { zoomControl: false })
        .setView([${normalizedUser.latitude}, ${normalizedUser.longitude}], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.marker([${normalizedUser.latitude}, ${normalizedUser.longitude}])
        .addTo(map)
        .bindPopup('You')
        .openPopup();

      ${patientJS}
    </script>
  </body>
</html>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    normalizedUser?.latitude,
    normalizedUser?.longitude,
    normalizedPatient?.latitude,
    normalizedPatient?.longitude,
  ]);

  if (!html) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          mixedContentMode="always"
        />
      </View>

      {!!estimatedArrival && (
        <View style={styles.etaContainer}>
          <View style={styles.etaDot} />
          <View>
            <Text style={styles.etaTitle}>Estimated Arrival</Text>
            <Text style={styles.etaText}>{estimatedArrival}</Text>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.statusOverlay}>
          <ActivityIndicator size="small" color="#0D9488" />
        </View>
      )}

      {waitingForEmergency && !isLoading && (
        <View style={styles.statusOverlay}>
          <Text style={styles.waitingText}>Waiting for Emergency...</Text>
        </View>
      )}
    </View>
  );
};

const calculateETA = (from: Coordinates, to: Coordinates): string => {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const minutes = Math.max(1, Math.round((distance / 40) * 60));
  return `${minutes}-${minutes + 3} min`;
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
  },
  loader: {
    width: "100%",
    height: 500,
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 28,
  },
  waitingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
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
    shadowOffset: { width: 0, height: 4 },
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
