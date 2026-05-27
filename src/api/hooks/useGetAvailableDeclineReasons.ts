import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type DeclineReason = {
  id: string;
  name: string;
};

export const useGetAvailableDeclineReasons = () => {
  return useQuery({
    queryKey: ["getAvailableDeclineReasons"],
    queryFn: async () => {
      const response = await axiosInstance.get<DeclineReason[]>(
        "/reference/available-values/decline-reason",
      );
      if (response.status === 200) return response.data;
    },
    refetchOnWindowFocus: true,
  });
};
