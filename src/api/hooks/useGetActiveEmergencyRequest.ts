import { Coordinates, SymptomTreeNode } from "@/types/emergency";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from "../axiosInstance";

export type { Coordinates, SymptomTreeNode };

/**
 * Matches the actual /api/emergency/assigned response shape.
 * This is intentionally identical to EmergencyAssignedPayload so the mapping
 * in index.tsx is trivial.
 */
export interface ActiveEmergency {
  emergencyId: string;
  location: Coordinates;
  initiatorName: string;
  symptoms: SymptomTreeNode[];
  diseases: string[];
  allergies: string[];
}

export const useGetActiveEmergencyRequest = () => {
  return useQuery({
    queryKey: ["getActiveEmergencyRequest"],
    queryFn: async (): Promise<ActiveEmergency | null> => {
      try {
        const response = await axiosInstance.get<ActiveEmergency>(
          "/emergency/assigned",
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    refetchOnWindowFocus: true,
  });
};
