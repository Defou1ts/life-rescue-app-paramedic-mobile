import type { SymptomTreeNode } from "@/types/emergency";
import { Text, View } from "react-native";

type Props = {
  nodes: SymptomTreeNode[];
};

export const SymptomTree = ({ nodes }: Props) => {
  return (
    <View>
      {nodes.map((node) => (
        <View
          key={node.questionId}
          style={{
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,

              fontWeight: "700",
            }}
          >
            {node.questionText}
          </Text>

          {node.selectedAnswers.map((answer) => (
            <View
              key={answer.answerId}
              style={{
                marginLeft: 16,

                marginTop: 8,
              }}
            >
              <Text>• {answer.answerText}</Text>

              <SymptomTree nodes={answer.childrenQuestion} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
