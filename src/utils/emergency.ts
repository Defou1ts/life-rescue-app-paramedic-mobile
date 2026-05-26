import { ActiveEmergency } from "@/api/hooks/useGetActiveEmergencyRequest";

export const extractEmergencySelections = (emergency: ActiveEmergency) => {
  const questionIds: string[] = [];

  const answerIds: string[] = [];

  const walk = (questions: any[]) => {
    questions.forEach((question) => {
      questionIds.push(question.questionId);

      question.selectedAnswers.forEach((answer: any) => {
        answerIds.push(answer.answerId);

        walk(answer.childrenQuestion);
      });
    });
  };

  walk(emergency.symptomTree);

  return {
    questionIds,
    answerIds,
  };
};
