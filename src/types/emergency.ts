export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SymptomTreeNode {
  questionId: string;
  questionText: string;
  selectedAnswers: {
    answerId: string;
    answerText: string;
    childrenQuestion: SymptomTreeNode[];
  }[];
}

export interface EmergencyAssignedPayload {
  emergencyId: string;
  location: Coordinates;
  initiatorName: string;
  symptoms: SymptomTreeNode[];
  diseases: string[];
  allergies: string[];
}

export interface EmergencyFinishedPayload {
  emergencyId: string;
}
