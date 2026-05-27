import { tokenStorage } from "@/store/tokenStorage";

import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

export type EmergencyUpdatePayload = {
  emergencyId: string;

  location: {
    latitude: number;
    longitude: number;
  };

  initiatorName: string;

  symptoms: string[];

  diseases: string[];

  allergies: string[];
};

class SignalRService {
  private connection: HubConnection | null = null;

  onReceiveEmergencyUpdate?:
    | ((payload: EmergencyUpdatePayload) => void)
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

    this.connection.on("ReceiveEmergencyUpdate", (payload) => {
      this.onReceiveEmergencyUpdate?.(payload);
    });

    await this.connection.start();

    return this.connection;
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
