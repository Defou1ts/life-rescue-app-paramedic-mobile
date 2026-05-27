import { axiosInstance } from "../axiosInstance";

type DeclineEmergencyRequest = {
  reason: number;
  reasonExplanation: string;
};

export const useDeclineEmergency = () => {
  return async (request: DeclineEmergencyRequest) => {
    const response = await axiosInstance.post(`/emergency/decline`, request);

    return response.data;
  };
};
