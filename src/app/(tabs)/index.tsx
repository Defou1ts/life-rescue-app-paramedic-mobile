import { useEffect, useState } from "react";

import * as Location from "expo-location";

import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/button";

import { EmergencyMap } from "@/components/emergency-map";

import { signalRService } from "@/services/signalr";

import { useGetActiveEmergencyRequest } from "@/api/hooks/useGetActiveEmergencyRequest";

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

  const [emergencyPayload, setEmergencyPayload] = useState<any>(null);

  const [emergencyMode, setEmergencyMode] = useState(false);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [declineVisible, setDeclineVisible] = useState(false);

  const [finishVisible, setFinishVisible] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    return () => {
      signalRService.stopConnection();
    };
  }, []);

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

  const startEmergency = async () => {
    setEmergencyMode(true);

    await signalRService.startConnection();

    signalRService.onReceiveEmergencyUpdate = (payload) => {
      setEmergencyPayload(payload);

      setPatientLocation(payload.location);
    };
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

      {detailsVisible && (
        <EmergencyDetailsSheet
          payload={emergencyPayload}
          symptomTree={activeEmergency?.symptomTree || []}
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
