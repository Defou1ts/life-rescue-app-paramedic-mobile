import { useEffect, useRef, useState } from "react";

import * as Location from "expo-location";

import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/button";
import { DeclineSheet } from "@/components/decline-sheet/Index";
import { EmergencyDetailsSheet } from "@/components/emergency-details-sheet";
import { EmergencyMap } from "@/components/emergency-map";
import { FinishSheet } from "@/components/finish-sheet";

import { useDeclineEmergency } from "@/api/hooks/useDeclineEmergency";
import { useFinishEmergency } from "@/api/hooks/useFinishEmergency";
import {
  type ActiveEmergency,
  useGetActiveEmergencyRequest,
} from "@/api/hooks/useGetActiveEmergencyRequest";
import { useGetAvailableDeclineReasons } from "@/api/hooks/useGetAvailableDeclineReasons";
import { useGetAvailableFinishReasons } from "@/api/hooks/useGetAvailableFinishReasons";

import { signalRService } from "@/services/signalr";
import type { Coordinates, EmergencyAssignedPayload } from "@/types/emergency";
import BottomSheet from "@expo/ui/community/bottom-sheet";
import Toast from "react-native-toast-message";

type Coords = {
  latitude: number;
  longitude: number;
};

const MOCK_LOCATION: Coords = { latitude: 53.9023, longitude: 27.5619 };

const QUERY_KEY = ["getActiveEmergencyRequest"] as const;

/**
 * Maps the REST response to the unified payload shape.
 * The API already returns fields matching EmergencyAssignedPayload,
 * so this is a straight pass-through with null-safety guards.
 */
const fromActiveEmergency = (e: ActiveEmergency): EmergencyAssignedPayload => ({
  emergencyId: e.emergencyId,
  location: e.location,
  initiatorName: e.initiatorName ?? "",
  symptoms: e.symptoms ?? [],
  diseases: e.diseases ?? [],
  allergies: e.allergies ?? [],
});

export default function Home() {
  const queryClient = useQueryClient();

  const {
    data: activeEmergency, // ActiveEmergency | null | undefined
    isPending: isLoadingEmergency,
    isFetched: isEmergencyFetched,
  } = useGetActiveEmergencyRequest();

  const { data: declineReasons } = useGetAvailableDeclineReasons();
  const { data: finishReasons } = useGetAvailableFinishReasons();
  const declineEmergency = useDeclineEmergency();
  const finishEmergency = useFinishEmergency();

  const sheetRef = useRef<BottomSheet>(null);
  const declineSheetRef = useRef<BottomSheet>(null);
  const finishSheetRef = useRef<BottomSheet>(null);

  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  /**
   * Emergency received via SignalR ReceiveEmergencyAssigned.
   * Contains full data (diseases, allergies, symptoms).
   */
  const [signalREmergency, setSignalREmergency] =
    useState<EmergencyAssignedPayload | null>(null);

  /**
   * Patient location that updates from ReceiveEmergencyUpdate messages.
   * When null, falls back to emergency.location.
   */
  const [patientLocationOverride, setPatientLocationOverride] =
    useState<Coordinates | null>(null);

  const userLocationRef = useRef<Coords | null>(null);
  const subscribedIdRef = useRef<string | null>(null);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  //
  // emergency is derived purely at render time — no useEffect needed.
  // Priority: SignalR message (full data) > API response (partial data).
  //
  const apiEmergency: EmergencyAssignedPayload | null = activeEmergency
    ? fromActiveEmergency(activeEmergency)
    : null;

  const emergency: EmergencyAssignedPayload | null =
    signalREmergency ?? apiEmergency;

  const patientLocation: Coordinates | null =
    patientLocationOverride ?? emergency?.location ?? null;

  const hasEmergency = emergency !== null;

  // Show "Waiting" only after the initial fetch has completed and no emergency
  const isWaiting = isEmergencyFetched && !hasEmergency;

  // ─── RESET ────────────────────────────────────────────────────────────────
  const resetEmergency = () => {
    subscribedIdRef.current = null;
    setSignalREmergency(null);
    setPatientLocationOverride(null);
    declineSheetRef.current?.close();
    sheetRef.current?.close();
    finishSheetRef.current?.close();
    // Clear cache so next render sees null immediately (no stale assignment)
    queryClient.setQueryData(QUERY_KEY, null);
  };

  // ─── GPS ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let watchSub: Location.LocationSubscription | null = null;
    let cancelled = false;

    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let coords: Coords;
      if (status !== "granted") {
        coords = MOCK_LOCATION;
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }

      if (cancelled) return;
      setUserLocation(coords);

      watchSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        },
      );
    };

    void init();
    return () => {
      cancelled = true;
      watchSub?.remove();
    };
  }, []);

  // ─── LOCATION HEARTBEAT (always, every 30 s) ─────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const loc = userLocationRef.current;
      if (!loc) return;
      void signalRService
        .sendLocationUpdate(loc)
        .catch((err) => console.error("sendLocationUpdate failed:", err));
    }, 30_000);

    return () => clearInterval(id);
  }, []);

  // ─── SIGNALR SETUP ────────────────────────────────────────────────────────
  useEffect(() => {
    signalRService.onReceiveEmergencyAssigned = (payload) => {
      setSignalREmergency(payload);
      // Treat assignment message location as the first known patient position
      setPatientLocationOverride(payload.location);
    };

    signalRService.onReceiveEmergencyUpdate = (payload) => {
      console.log("Received EmergencyUpdate:", payload);
      setPatientLocationOverride(payload.location);
    };

    signalRService.onReceiveFinishedEmergency = () => {
      resetEmergency();
    };

    void signalRService
      .startConnection()
      .catch((err) => console.error("SignalR connect failed:", err));

    return () => {
      signalRService.onReceiveEmergencyAssigned = null;
      signalRService.onReceiveEmergencyUpdate = null;
      signalRService.onReceiveFinishedEmergency = null;
      void signalRService.stopConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── SUBSCRIBE TO EMERGENCY ───────────────────────────────────────────────
  // Fires whenever the active emergency ID changes (from API or SignalR).
  // Calls SubscribeToEmergency once per unique emergencyId.
  useEffect(() => {
    const id = emergency?.emergencyId;
    if (!id) return;
    if (subscribedIdRef.current === id) return;

    subscribedIdRef.current = id;
    void signalRService
      .subscribeToEmergency(id)
      .catch((err) => console.error("subscribeToEmergency failed:", err));
  }, [emergency?.emergencyId]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <EmergencyMap
        userLocation={userLocation}
        patientLocation={patientLocation}
        waitingForEmergency={isWaiting}
        isLoading={isLoadingEmergency}
      />

      {hasEmergency && (
        <View style={styles.actions}>
          <AppButton type="outline" onPress={() => sheetRef.current?.expand()}>
            Details
          </AppButton>

          <AppButton
            type="outline"
            containerStyle={styles.declineButton}
            textStyle={styles.declineText}
            onPress={() => declineSheetRef.current?.expand()}
          >
            Decline
          </AppButton>

          <AppButton
            type="primary"
            onPress={() => finishSheetRef.current?.expand()}
          >
            Finish
          </AppButton>
        </View>
      )}

      {emergency && (
        <EmergencyDetailsSheet
          sheetRef={sheetRef}
          payload={emergency}
          symptomTree={
            (emergency.symptoms ?? []).length > 0
              ? emergency.symptoms
              : (activeEmergency?.symptoms ?? [])
          }
        />
      )}

      <DeclineSheet
        sheetRef={declineSheetRef}
        reasons={declineReasons ?? []}
        onSubmit={async (reason, explanation) => {
          await declineEmergency({
            reason: Number(reason),
            reasonExplanation: explanation, 
          });
          Toast.show({
            type: "success",
            text1: "Emergency declined",
          });
          resetEmergency();
        }}
      />

      <FinishSheet
        sheetRef={finishSheetRef}
        reasons={finishReasons ?? []}
        onSubmit={async (reason, explanation) => {
          await finishEmergency({
            resolution: Number(reason),
            resolutionExplanation: explanation,
          });
          Toast.show({
            type: "success",
            text1: "Emergency finished",
          });
          resetEmergency();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actions: {
    marginTop: 24,
    gap: 16,
  },
  declineButton: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  declineText: {
    color: "#FFFFFF",
  },
});
