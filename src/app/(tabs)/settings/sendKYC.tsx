import { useSendKYC } from "@/api/hooks/useSendKYC";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

type FileState = string | null;

export default function SendKYC() {
  const { mutate, isPending } = useSendKYC();

  const [identityDocument, setIdentityDocument] = useState<FileState>(null);

  const [selfie, setSelfie] = useState<FileState>(null);

  const [licence, setLicence] = useState<FileState>(null);

  const pickImage = async (
    setter: (value: string | null) => void,
    fromCamera = false,
  ) => {
    try {
      let result;

      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert("Permission denied", "Camera permission is required");
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert("Permission denied", "Gallery permission is required");
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setter(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const onSubmit = () => {
    if (!identityDocument || !selfie || !licence) {
      Alert.alert("Validation error", "Please upload all files");
      return;
    }

    mutate({
      identityDocument,
      selfie,
      licence,
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.contentWrapper}
        onPress={() => pickImage(setIdentityDocument)}
      >
        <AntDesign
          name={identityDocument ? "check" : "paper-clip"}
          size={50}
          color="#098E89"
        />

        <AppText>Identity Document</AppText>
      </Pressable>

      <Pressable
        style={styles.contentWrapper}
        onPress={() => pickImage(setSelfie, true)}
      >
        <AntDesign
          name={selfie ? "check" : "paper-clip"}
          size={50}
          color="#098E89"
        />

        <AppText>Selfie</AppText>
      </Pressable>

      <Pressable
        style={styles.contentWrapper}
        onPress={() => pickImage(setLicence)}
      >
        <AntDesign
          name={licence ? "check" : "paper-clip"}
          size={50}
          color="#098E89"
        />

        <AppText>Licence</AppText>
      </Pressable>

      <AppButton
        type="primary"
        containerStyle={{ marginTop: 40 }}
        onPress={onSubmit}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Send"}
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 21,
  },

  contentWrapper: {
    width: "80%",
    paddingVertical: 45,
    paddingHorizontal: 32,
    borderRadius: 45,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    flexDirection: "row",
    backgroundColor: "#EBF1F5",

    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 8,
  },
});
