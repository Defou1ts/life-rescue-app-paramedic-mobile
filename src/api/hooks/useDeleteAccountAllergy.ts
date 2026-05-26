import { queryClient } from "@/config/queryClient";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export const useDeleteAccountAllergy = () => {
  return useMutation({
    mutationKey: ["deleteAccountAllergy"],
    mutationFn: async (allergyId: string) => {
      await axiosInstance.delete(`/allergy/account/${allergyId}`);
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["allergies"],
      });
      Toast.show({
        type: "success",
        text1: "Allergy deleted",
        text2: `You have successfully deleted the allergy from your allergies list.`,
      });
    },
  });
};
