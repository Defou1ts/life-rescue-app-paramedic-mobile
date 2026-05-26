import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export const useAddDiseaseToAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (diseaseId: string) => {
      console.log(diseaseId);
      return axiosInstance.post(`/disease/account/${diseaseId}`);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["diseases"] });
    },
  });
};
