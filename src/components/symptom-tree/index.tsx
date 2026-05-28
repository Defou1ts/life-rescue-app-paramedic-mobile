import type { SymptomTreeNode } from "@/types/emergency";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  nodes: SymptomTreeNode[];
  depth?: number;
};

export const SymptomTree = ({ nodes, depth = 0 }: Props) => {
  if (!nodes.length) return null;

  return (
    <View style={depth > 0 ? styles.nested : undefined}>
      {nodes.map((node, i) => (
        <View key={node.questionId} style={[styles.node, i > 0 && styles.nodeGap]}>
          <Text style={[styles.question, depth === 0 && styles.questionRoot]}>
            {node.questionText}
          </Text>

          {node.selectedAnswers.map((answer) => (
            <View key={answer.answerId} style={styles.answerBlock}>
              <View style={styles.answerRow}>
                <View style={styles.dot} />
                <Text style={styles.answerText}>{answer.answerText}</Text>
              </View>

              <SymptomTree nodes={answer.childrenQuestion} depth={depth + 1} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  nested: {
    marginLeft: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB",
    marginTop: 6,
  },
  node: {},
  nodeGap: { marginTop: 16 },
  question: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  questionRoot: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  answerBlock: { marginTop: 8 },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#0D9488",
    flexShrink: 0,
  },
  answerText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
});
