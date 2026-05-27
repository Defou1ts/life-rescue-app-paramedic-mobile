import {
  Coordinates,
  SymptomTreeNode,
} from "@/types/emergency";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type EmergencyStatus = "Ongoing" | "Finished";

export type { Coordinates, SymptomTreeNode };

export interface ActiveEmergency {
  id: string;

  initiatorId: string;

  initiatorLocation: Coordinates;

  currentParamedicLocation: Coordinates | null;

  assignedParamedicId: string | null;

  paramedicName: string | null;

  status: EmergencyStatus;

  symptomTree: SymptomTreeNode[];
}

export const useGetActiveEmergencyRequest = () => {
  return useQuery({
    queryKey: ["getActiveEmergencyRequest"],
    queryFn: async () => {
      const response = await axiosInstance.get<ActiveEmergency>(
        "/emergency/assigned",
      );
      if (response.status === 200) return response.data;
    },
    refetchOnWindowFocus: true,
  });
};
