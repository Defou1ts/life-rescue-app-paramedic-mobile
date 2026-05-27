import { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useState } from "react";
import { AppButton } from "../button";

type Props = {
  reasons: any[];

  onSubmit: (
    reason: string,

    explanation: string,
  ) => void;
};

export const DeclineSheet = ({
  reasons,

  onSubmit,
}: Props) => {
  const [selected, setSelected] = useState("");

  const [explanation, setExplanation] = useState("");

  return (
    <BottomSheet snapPoints={["50%", "90%"]}>
      <BottomSheetView>
        <View
          style={{
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,

              fontWeight: "700",

              marginBottom: 20,
            }}
          >
            Decline Emergency
          </Text>

          <FlatList
            data={reasons}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelected(item.id)}
                style={{
                  padding: 16,

                  borderRadius: 20,

                  backgroundColor: selected === item.id ? "#0D9488" : "#EBF1F5",

                  marginBottom: 12,
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Explanation"
            style={{
              height: 120,

              backgroundColor: "#EBF1F5",

              borderRadius: 20,

              padding: 16,

              marginTop: 16,
            }}
            multiline
          />

          <AppButton
            type="primary"
            containerStyle={{
              marginTop: 20,
            }}
            onPress={() =>
              onSubmit(
                selected,

                explanation,
              )
            }
          >
            Submit
          </AppButton>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
