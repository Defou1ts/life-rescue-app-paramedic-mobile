import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export const useAddAllergiesToAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (allergyId: string) => {
      console.log(allergyId);
      return axiosInstance.post(`/allergy/account/${allergyId}`);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["allergies"] });
    },
  });
};
