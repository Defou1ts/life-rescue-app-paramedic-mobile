import { useMutation } from "@tanstack/react-query";

import { axiosInstance } from "../axiosInstance";

export type RateEmergencyRequest = {
  emergencyId: string;

  feedBack: string;

  rate: number;
};

export const useRateEmergency = () => {
  return useMutation({
    mutationKey: ["rateEmergency"],

    mutationFn: async ({
      emergencyId,
      feedBack,
      rate,
    }: RateEmergencyRequest) => {
      const response = await axiosInstance.post(
        `/api/v1/emergency/${emergencyId}/rating`,
        {
          feedBack,
          rate,
        },
      );

      return response.data;
    },
  });
};
