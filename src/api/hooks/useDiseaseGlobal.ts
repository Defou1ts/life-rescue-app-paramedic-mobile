import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { AllergiesResponse } from "./useAllergies";
import { DiseasesResponse } from "./useDiseases";

export const useDiseasesGlobal = () => {
  return useQuery({
    queryKey: ["diseasesGlobal"],
    queryFn: async () => {
      const res = await axiosInstance.get("/disease/global");
      return res.data as DiseasesResponse;
    },
  });
};
