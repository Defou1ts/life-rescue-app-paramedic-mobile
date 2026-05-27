import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type FinishReason = {
  id: string;
  name: string;
};

export const useGetAvailableFinishReasons = () => {
  return useQuery({
    queryKey: ["getAvailableFinishReasons"],
    queryFn: async () => {
      const response = await axiosInstance.get<FinishReason[]>(
        "/reference/available-values/finish-reason",
      );
      if (response.status === 200) return response.data;
    },
    refetchOnWindowFocus: true,
  });
};
