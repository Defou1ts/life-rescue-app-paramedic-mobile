import { tokenStorage } from "@/store/tokenStorage";
import type {
  Coordinates,
  EmergencyAssignedPayload,
  EmergencyFinishedPayload,
} from "@/types/emergency";

import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

export type EmergencyUpdatePayload = {
  emergencyId: string;
  location: Coordinates;
  initiatorName: string;
  symptoms: EmergencyAssignedPayload["symptoms"];
  diseases: string[];
  allergies: string[];
};

class SignalRService {
  private connection: HubConnection | null = null;

  onReceiveEmergencyUpdate?:
    | ((payload: EmergencyUpdatePayload) => void)
    | null = null;

  onReceiveEmergencyAssigned?:
    | ((payload: EmergencyAssignedPayload) => void)
    | null = null;

  onReceiveFinishedEmergency?:
    | ((payload: EmergencyFinishedPayload) => void)
    | null = null;

  async startConnection() {
    if (this.connection && this.connection.state === "Connected") {
      return this.connection;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl("http://10.0.2.2:5034/paramedicHub", {
        accessTokenFactory: async () => {
          const token = await tokenStorage.getAccessToken();
          return token || "";
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on(
      "ReceiveEmergencyUpdate",
      (payload: EmergencyUpdatePayload) => {
        this.onReceiveEmergencyUpdate?.(payload);
      },
    );

    this.connection.on(
      "ReceiveEmergencyAssigned",
      (payload: EmergencyAssignedPayload) => {
        this.onReceiveEmergencyAssigned?.(payload);
      },
    );

    this.connection.on(
      "ReceiveFinishedEmergency",
      (payload: EmergencyFinishedPayload | string) => {
        const normalized: EmergencyFinishedPayload =
          typeof payload === "string" ? { emergencyId: payload } : payload;
        this.onReceiveFinishedEmergency?.(normalized);
      },
    );

    await this.connection.start();

    return this.connection;
  }

  async subscribeToEmergency(emergencyId: string) {
    const connection = await this.startConnection();
    await connection.invoke("SubscribeToEmergency", emergencyId);
  }

  async sendLocationUpdate(location: Coordinates) {
    const connection = await this.startConnection();
    await connection.invoke("SendLocationUpdate", { location });
  }

  async stopConnection() {
    if (!this.connection) {
      return;
    }

    await this.connection.stop();
    this.connection = null;
  }
}

export const signalRService = new SignalRService();
