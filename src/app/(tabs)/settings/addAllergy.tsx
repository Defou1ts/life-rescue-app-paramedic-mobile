import { useAddAllergiesToAccount } from "@/api/hooks/useAddAllergyToAccount";
import { useAddCustomAllergy } from "@/api/hooks/useAddCustomAllergy";
import { useAllergiesGlobal } from "@/api/hooks/useAllergiesGlobal";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Logo = require("@/assets/images/logo.png");

export default function AddAllergy() {
  const { data: allergiesData, isLoading: isLoadingAllergies } =
    useAllergiesGlobal();

  const [customAllergyName, setCustomAllergyName] = useState("");
  const [selectedAllergiesIds, setSelectedAllergiesIds] = useState<string[]>(
    [],
  );

  const { mutate, isPending } = useAddCustomAllergy();
  const { mutateAsync: addAllergyToAccount, isPending: isAddingAllergy } =
    useAddAllergiesToAccount();

  const sheetRef = useRef<BottomSheet>(null);
  if (isLoadingAllergies || !allergiesData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleSavePress = async () => {
    try {
      await Promise.all(
        selectedAllergiesIds.map((id) => addAllergyToAccount(id)),
      );
    } catch (error) {
      console.error("Failed to add allergies to account", error);
    } finally {
      router.replace("/(tabs)/settings/editAllergy");
    }
  };

  const allergies =
    allergiesData.length === 0
      ? [{ id: "default", name: "No allergies" }]
      : allergiesData;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={Logo} style={styles.image} />
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoHeaderText}>Allergy</Text>
          </View>

          <View style={styles.listContainer}>
            <FlatList
              data={allergies}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedAllergiesIds((prev) => {
                      if (prev.includes(item.id)) {
                        return prev.filter((id) => id !== item.id);
                      } else {
                        return [...prev, item.id];
                      }
                    });
                  }}
                >
                  <View
                    style={[
                      styles.listContent,
                      selectedAllergiesIds.includes(item.id) &&
                        styles.selectedListContent,
                    ]}
                  >
                    <Text style={styles.infoText}>{item.name}</Text>
                    {selectedAllergiesIds.includes(item.id) &&
                      isAddingAllergy && (
                        <ActivityIndicator
                          size="small"
                          style={{ marginLeft: 10 }}
                        />
                      )}
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <AppButton type="primary" onPress={() => sheetRef.current?.expand()}>
            Custom Allergy
          </AppButton>

          <AppButton
            onPress={handleSavePress}
            containerStyle={styles.saveButton}
            type="primary"
            disabled={isAddingAllergy}
          >
            Save
          </AppButton>
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={["50%", "100%"]}
          index={-1}
          enablePanDownToClose
        >
          <BottomSheetView
            style={{
              flex: 1,
              paddingHorizontal: 44,
              gap: 52,
              paddingVertical: 20,
            }}
          >
            <Title>Custom Allergy</Title>
            <Input
              value={customAllergyName}
              placeholder="Name"
              onChangeText={setCustomAllergyName}
            />
            {isPending && <ActivityIndicator size="large" />}
            <AppButton
              type="primary"
              disabled={isPending || customAllergyName.trim() === ""}
              onPress={() => {
                mutate(customAllergyName);
                setCustomAllergyName("");
              }}
            >
              Add
            </AppButton>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "90%",
    flex: 1,
    paddingBottom: 30,
  },

  imageContainer: {
    alignItems: "flex-end",
    marginBottom: 45,
    marginTop: 20,
  },

  image: {
    width: 114,
    height: 114,
  },

  infoWrapper: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 45,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    padding: 20,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  infoHeaderText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "bold",
  },

  listContainer: {
    flex: 1,
    gap: 12,
    overflow: "hidden",
  },

  listContent: {
    borderRadius: 25,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#b4b3b3",
    marginHorizontal: 4,
    height: 63,

    alignItems: "center",
    justifyContent: "center",
  },
  selectedListContent: {
    backgroundColor: "#0D948826",
  },
  infoText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "300",
  },

  buttonsContainer: {
    marginTop: "auto",
  },

  saveButton: {
    marginTop: 20,
  },
});
