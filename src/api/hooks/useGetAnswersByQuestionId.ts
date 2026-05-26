import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type Answer = {
  id: string;
  text: string;
  instructionText: string;
  animationKey: AnimationKey;
  questionId: string;
};

export interface AnimationKey {
  base64Content: string;
  fileName: string;
}

export const useGetAnswersByQuestionId = (
  questionId: string,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: ["getAnswersByQuestionId", questionId],

    enabled: options?.enabled,

    queryFn: async () => {
      const response = await axiosInstance.get<Answer[]>(
        `/symptom/questions/${questionId}/answers`,
      );

      return response.data;
    },
  });
};
