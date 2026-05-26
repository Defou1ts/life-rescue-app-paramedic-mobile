import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type CreateEmergencyRequest = {
  initiatorLatitude: number;
  initiatorLongitude: number;
  questionIds: string[];
  answerOptionsIds: string[];
};

export const useCreateEmergency = () => {
  return useMutation({
    mutationKey: ["createEmergency"],
    mutationFn: async (requestData: CreateEmergencyRequest) => {
      const response = await axiosInstance.post("/emergency", requestData);

      return response.data;
    },
  });
};
