import { useEffect, useRef, useState } from "react";

import * as Location from "expo-location";

import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/button";

import { EmergencyMap } from "@/components/emergency-map";

import { signalRService } from "@/services/signalr";

import { useGetActiveEmergencyRequest } from "@/api/hooks/useGetActiveEmergencyRequest";
import type { EmergencyAssignedPayload } from "@/types/emergency";

import { EmergencyDetailsSheet } from "@/components/emergency-details-sheet";

import { FinishSheet } from "@/components/finish-sheet";

import { useGetAvailableDeclineReasons } from "@/api/hooks/useGetAvailableDeclineReasons";

import { useGetAvailableFinishReasons } from "@/api/hooks/useGetAvailableFinishReasons";

import { useDeclineEmergency } from "@/api/hooks/useDeclineEmergency";

import { useFinishEmergency } from "@/api/hooks/useFinishEmergency";
import { DeclineSheet } from "@/components/decline-sheet/Index";

type Coords = {
  latitude: number;
  longitude: number;
};

const MOCK_LOCATION = {
  latitude: 53.9023,
  longitude: 27.5619,
};

export default function Home() {
  const { data: activeEmergency } = useGetActiveEmergencyRequest();

  const { data: declineReasons } = useGetAvailableDeclineReasons();

  const { data: finishReasons } = useGetAvailableFinishReasons();

  const declineEmergency = useDeclineEmergency();

  const finishEmergency = useFinishEmergency();

  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  const [patientLocation, setPatientLocation] = useState<Coords | null>(null);

  const [emergencyPayload, setEmergencyPayload] =
    useState<EmergencyAssignedPayload | null>(null);

  const [emergencyMode, setEmergencyMode] = useState(false);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [declineVisible, setDeclineVisible] = useState(false);

  const [finishVisible, setFinishVisible] = useState(false);

  const userLocationRef = useRef<Coords | null>(null);

  userLocationRef.current = userLocation;

  const initialize = async () => {
    let coords: Coords;

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
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

    setUserLocation(coords);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,

        timeInterval: 3000,

        distanceInterval: 5,
      },

      (location) => {
        setUserLocation({
          latitude: location.coords.latitude,

          longitude: location.coords.longitude,
        });
      },
    );
  };

  useEffect(() => {
    const initTimeoutId = setTimeout(() => {
      void initialize();
    }, 0);

    signalRService.onReceiveEmergencyAssigned = async (payload) => {
      setEmergencyPayload(payload);
      setPatientLocation(payload.location);
      setEmergencyMode(true);

      try {
        await signalRService.subscribeToEmergency(payload.emergencyId);
      } catch (error) {
        console.error("Failed to subscribe to emergency:", error);
      }
    };

    signalRService.onReceiveEmergencyUpdate = (payload) => {
      setPatientLocation(payload.location);
    };

    const connect = async () => {
      try {
        await signalRService.startConnection();
      } catch (error) {
        console.error("Failed to connect to SignalR:", error);
      }
    };

    void connect();

    return () => {
      clearTimeout(initTimeoutId);
      signalRService.onReceiveEmergencyAssigned = null;
      signalRService.onReceiveEmergencyUpdate = null;
      void signalRService.stopConnection();
    };
  }, []);

  useEffect(() => {
    if (!emergencyMode) {
      return;
    }

    const sendLocation = () => {
      const location = userLocationRef.current;

      if (!location) {
        return;
      }

      void signalRService.sendLocationUpdate(location).catch((error) => {
        console.error("Failed to send location update:", error);
      });
    };

    sendLocation();

    const intervalId = setInterval(sendLocation, 30_000);

    return () => clearInterval(intervalId);
  }, [emergencyMode]);

  const startEmergency = () => {
    setEmergencyMode(true);
  };

  return (
    <View style={styles.container}>
      <EmergencyMap
        userLocation={userLocation}
        patientLocation={emergencyMode ? patientLocation : null}
      />

      <View
        style={{
          marginTop: 24,
        }}
      >
        <AppButton
          type="primary"
          disabled={!activeEmergency}
          onPress={startEmergency}
        >
          Active Emergency
        </AppButton>

        {emergencyMode && (
          <>
            <AppButton
              type="outline"
              containerStyle={{
                marginTop: 16,
              }}
              onPress={() => setDetailsVisible(true)}
            >
              Details
            </AppButton>

            <AppButton
              type="outline"
              containerStyle={{
                marginTop: 16,

                backgroundColor: "#DC2626",
              }}
              onPress={() => setDeclineVisible(true)}
            >
              Decline
            </AppButton>

            <AppButton
              type="primary"
              containerStyle={{
                marginTop: 16,
              }}
              onPress={() => setFinishVisible(true)}
            >
              Finish
            </AppButton>
          </>
        )}
      </View>

      {detailsVisible && emergencyPayload && (
        <EmergencyDetailsSheet
          payload={emergencyPayload}
          symptomTree={
            emergencyPayload.symptoms.length > 0
              ? emergencyPayload.symptoms
              : activeEmergency?.symptomTree || []
          }
        />
      )}

      {declineVisible && (
        <DeclineSheet
          reasons={declineReasons || []}
          onSubmit={async (reason, explanation) => {
            await declineEmergency({
              reason: Number(reason),

              reasonExplanation: explanation,
            });

            setDeclineVisible(false);
          }}
        />
      )}

      {finishVisible && (
        <FinishSheet
          reasons={finishReasons || []}
          onSubmit={async (reason, explanation) => {
            await finishEmergency({
              resolution: Number(reason),

              resolutionExplanation: explanation,
            });

            setFinishVisible(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 20,
  },
});
