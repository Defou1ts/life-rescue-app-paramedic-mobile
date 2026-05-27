import type {
  EmergencyAssignedPayload,
  SymptomTreeNode,
} from "@/types/emergency";
import { ScrollView, Text, View } from "react-native";

import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { SymptomTree } from "../symptom-tree";

type Props = {
  payload: EmergencyAssignedPayload;

  symptomTree: SymptomTreeNode[];
};

export const EmergencyDetailsSheet = ({ payload, symptomTree }: Props) => {
  return (
    <BottomSheet snapPoints={["50%", "90%"]}>
      <BottomSheetView>
        <ScrollView
          style={{
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 28,

              fontWeight: "700",

              marginBottom: 20,
            }}
          >
            Details
          </Text>

          <Text
            style={{
              fontWeight: "700",
            }}
          >
            Diseases
          </Text>

          {payload?.diseases?.map((disease: string) => (
            <Text key={disease}>• {disease}</Text>
          ))}

          <View
            style={{
              marginTop: 18,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
              }}
            >
              Allergies
            </Text>

            {payload?.allergies?.map((allergy: string) => (
              <Text key={allergy}>• {allergy}</Text>
            ))}
          </View>

          <View
            style={{
              marginTop: 24,
            }}
          >
            <Text
              style={{
                fontWeight: "700",

                marginBottom: 16,
              }}
            >
              Symptom Tree
            </Text>

            <SymptomTree nodes={symptomTree} />
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};
