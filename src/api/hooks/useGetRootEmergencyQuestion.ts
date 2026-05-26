import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { Question } from "./useGetQuestionByAnswerId";

export const useGetRootEmergencyQuestion = () => {
  return useQuery({
    queryKey: ["getRootEmergencyQuestion"],
    queryFn: async () => {
      const response = await axiosInstance.get<Question>(
        "/symptom/questions/root",
      );

      // @ts-ignore
      return response.data[0] as Question;
    },
  });
};
