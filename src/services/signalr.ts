import { getHubAccessToken, refreshAccessToken } from "@/api/refreshAccessToken";
import { PARAMEDIC_HUB_URL } from "@/api/apiHost";
import { tokenStorage } from "@/store/tokenStorage";
import type {
  Coordinates,
  EmergencyAssignedPayload,
  EmergencyFinishedPayload,
} from "@/types/emergency";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
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

/** Default ASP.NET KeepAliveInterval is 15s; client timeout should be >= 2x. */
const SERVER_TIMEOUT_MS = 120_000;
const KEEP_ALIVE_INTERVAL_MS = 15_000;

class SignalRService {
  private connection: HubConnection | null = null;
  private subscribedEmergencyId: string | null = null;
  private startPromise: Promise<HubConnection> | null = null;

  onReceiveEmergencyUpdate?:
    | ((payload: EmergencyUpdatePayload) => void)
    | null = null;

  onReceiveEmergencyAssigned?:
    | ((payload: EmergencyAssignedPayload) => void)
    | null = null;

  onReceiveFinishedEmergency?:
    | ((payload: EmergencyFinishedPayload) => void)
    | null = null;

  private buildConnection(): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(PARAMEDIC_HUB_URL, {
        accessTokenFactory: () => getHubAccessToken(),
      })
      .withAutomaticReconnect()
      .withServerTimeout(SERVER_TIMEOUT_MS)
      .withKeepAliveInterval(KEEP_ALIVE_INTERVAL_MS)
      .configureLogging(LogLevel.Information)
      .build();

    connection.on(
      "ReceiveEmergencyUpdate",
      (payload: EmergencyUpdatePayload) => {
        this.onReceiveEmergencyUpdate?.(payload);
      },
    );

    connection.on(
      "ReceiveEmergencyAssigned",
      (payload: EmergencyAssignedPayload) => {
        this.onReceiveEmergencyAssigned?.(payload);
      },
    );

    connection.on(
      "ReceiveFinishedEmergency",
      (payload: EmergencyFinishedPayload | string) => {
        const normalized: EmergencyFinishedPayload =
          typeof payload === "string" ? { emergencyId: payload } : payload;
        this.onReceiveFinishedEmergency?.(normalized);
      },
    );

    connection.onreconnecting(() => {
      void refreshAccessToken().catch((err) =>
        console.error("Token refresh before SignalR reconnect failed:", err),
      );
    });

    connection.onreconnected(() => {
      void this.resubscribeToEmergency(connection);
    });

    return connection;
  }

  private async resubscribeToEmergency(connection: HubConnection) {
    if (!this.subscribedEmergencyId) {
      return;
    }

    try {
      await connection.invoke(
        "SubscribeToEmergency",
        this.subscribedEmergencyId,
      );
    } catch (err) {
      console.error("subscribeToEmergency after reconnect failed:", err);
    }
  }

  private waitForReconnected(): Promise<HubConnection> {
    return new Promise<HubConnection>((resolve, reject) => {
      const tid = setTimeout(
        () => reject(new Error("SignalR reconnect timed out")),
        30_000,
      );
      this.connection!.onreconnected(() => {
        clearTimeout(tid);
        this.startPromise = null;
        resolve(this.connection!);
      });
      this.connection!.onclose((err) => {
        clearTimeout(tid);
        this.startPromise = null;
        reject(err ?? new Error("SignalR connection closed while waiting"));
      });
    });
  }

  /**
   * Starts a new connection or returns the existing one.
   * Safe to call concurrently — all callers share the same in-flight promise
   * so only one HubConnection is ever created.
   */
  async startConnection(): Promise<HubConnection> {
    // All concurrent callers share the same promise — no double-creation.
    if (this.startPromise) {
      return this.startPromise;
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.connection?.state === HubConnectionState.Reconnecting) {
      this.startPromise = this.waitForReconnected();
      return this.startPromise;
    }

    // Assign BEFORE any await so concurrent calls see it immediately.
    this.startPromise = this._doStart();
    return this.startPromise;
  }

  private async _doStart(): Promise<HubConnection> {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
      }

      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error("Cannot start SignalR without access token");
      }

      this.connection = this.buildConnection();
      await this.connection.start();
      return this.connection;
    } finally {
      this.startPromise = null;
    }
  }

  async subscribeToEmergency(emergencyId: string) {
    this.subscribedEmergencyId = emergencyId;
    const connection = await this.startConnection();
    await connection.invoke("SubscribeToEmergency", emergencyId);
  }

  async sendLocationUpdate(location: Coordinates) {
    const connection = await this.startConnection();
    await connection.invoke("SendLocationUpdate", { location });
  }

  async stopConnection() {
    this.subscribedEmergencyId = null;
    this.startPromise = null;

    if (!this.connection) {
      return;
    }

    await this.connection.stop();
    this.connection = null;
  }
}

export const signalRService = new SignalRService();
