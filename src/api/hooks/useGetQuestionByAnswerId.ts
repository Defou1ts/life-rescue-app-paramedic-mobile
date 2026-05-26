import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type Question = {
  id: string;
  text: string;
  questionType: string;
  parentAnswerId: string;
};

export const useGetQuestionByAnswerId = (answerId: string) => {
  return useQuery({
    queryKey: ["getQuestionByAnswerId", answerId],
    queryFn: async () => {
      const response = await axiosInstance.get<Question>(
        `/symptom/questions/${answerId}`,
      );

      return response.data;
    },
  });
};
