import type {
  EmergencyAssignedPayload,
  SymptomTreeNode,
} from "@/types/emergency";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SymptomTree } from "../symptom-tree";

type Props = {
  payload: EmergencyAssignedPayload;
  symptomTree: SymptomTreeNode[];
  sheetRef: React.Ref<BottomSheet>;
};

export const EmergencyDetailsSheet = ({ payload, symptomTree,sheetRef }: Props) => {
  const diseases = payload.diseases ?? [];
  const allergies = payload.allergies ?? [];

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={["50%", "100%"]}
      index={-1}
      onChange={(index) => {
        console.log("onChange", index);
      }}
      onClose={() => {
        console.log("closed");
      }}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Details</Text>

          {!!payload.initiatorName && (
            <View style={styles.patientCard}>
              <Text style={styles.patientLabel}>Patient</Text>
              <Text style={styles.patientName}>{payload.initiatorName}</Text>
            </View>
          )}

          <Section title="Diseases">
            {diseases.length === 0 ? (
              <Text style={styles.empty}>—</Text>
            ) : (
              <View style={styles.tags}>
                {diseases.map((d, i) => (
                  <View key={`d-${i}`} style={[styles.tag, styles.tagDisease]}>
                    <Text style={styles.tagText}>{d}</Text>
                  </View>
                ))}
              </View>
            )}
          </Section>

          <Section title="Allergies">
            {allergies.length === 0 ? (
              <Text style={styles.empty}>—</Text>
            ) : (
              <View style={styles.tags}>
                {allergies.map((a, i) => (
                  <View key={`a-${i}`} style={[styles.tag, styles.tagAllergy]}>
                    <Text style={styles.tagText}>{a}</Text>
                  </View>
                ))}
              </View>
            )}
          </Section>

          <Section title="Symptom Tree" last>
            {symptomTree.length === 0 ? (
              <Text style={styles.empty}>No symptoms collected</Text>
            ) : (
              <SymptomTree nodes={symptomTree} />
            )}
          </Section>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const Section = ({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) => (
  <View style={[styles.section, last && styles.sectionLast]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  patientCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  patientLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  section: {
    marginBottom: 24,
  },
  sectionLast: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagDisease: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  tagAllergy: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  empty: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
