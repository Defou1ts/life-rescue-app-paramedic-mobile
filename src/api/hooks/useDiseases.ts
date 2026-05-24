import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type Disease = {
  id: string;
  name: string;
};

export type DiseaseResponse = Array<Disease>;


export const useDiseases = () => {
  return useQuery({
    queryKey: ["disease"],
    queryFn: async () => {
      const res = await axiosInstance.get("/disease/account");
      return res.data as DiseaseResponse;
    },
  });
};
