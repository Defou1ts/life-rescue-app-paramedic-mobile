import { axiosInstance } from "../axiosInstance";

type FinishEmergencyRequest = {
  resolution: number;
  resolutionExplanation: string;
};

export const useFinishEmergency = () => {
  return async (request: FinishEmergencyRequest) => {
    const response = await axiosInstance.post(`/emergency/finish`, request);

    return response.data;
  };
};
