import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { AllergiesResponse } from "./useAllergies";

export const useAllergiesGlobal = () => {
  return useQuery({
    queryKey: ["allergiesGlobal"],
    queryFn: async () => {
      const res = await axiosInstance.get("/allergy/global");
      return res.data as AllergiesResponse;
    },
  });
};
