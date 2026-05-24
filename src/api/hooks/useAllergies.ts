import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type Allergy = {
  id: string;
  name: string;
};

export type AllergiesResponse = Array<Allergy>;

export const useAllergies = () => {
  return useQuery({
    queryKey: ["allergies"],
    queryFn: async () => {
      const res = await axiosInstance.get("/allergy/account");
      return res.data as AllergiesResponse;
    },
  });
}