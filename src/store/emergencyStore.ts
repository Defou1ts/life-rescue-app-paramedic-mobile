import { create } from "zustand";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Store = {
  patientLocation: Coordinates | null;

  paramedicLocation: Coordinates | null;

  emergencyPayload: any | null;

  setPatientLocation: (location: Coordinates) => void;

  setParamedicLocation: (location: Coordinates) => void;

  setEmergencyPayload: (payload: any) => void;
};

export const useEmergencyStore = create<Store>((set) => ({
  patientLocation: null,

  paramedicLocation: null,

  emergencyPayload: null,

  setPatientLocation: (location) =>
    set({
      patientLocation: location,
    }),

  setParamedicLocation: (location) =>
    set({
      paramedicLocation: location,
    }),

  setEmergencyPayload: (payload) =>
    set({
      emergencyPayload: payload,
    }),
}));
