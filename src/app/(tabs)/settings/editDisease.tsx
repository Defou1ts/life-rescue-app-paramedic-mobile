import { useDeleteAccountDisease } from "@/api/hooks/useDeleteAccountDisease";
import { useDiseases } from "@/api/hooks/useDiseases";
import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
const Logo = require("@/assets/images/logo.png");

export default function EditDisease() {
  const { data: diseasesData, isLoading: isLoadingDiseases } = useDiseases();
  const { mutate: deleteDisease, isPending } = useDeleteAccountDisease();
  const router = useRouter();

  if (isLoadingDiseases || !diseasesData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "90%" }}>
        <View style={styles.imageContainer}>
          <Image source={Logo} style={styles.image} />
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoHeaderText}>Disease</Text>
            <Pressable
              onPress={() => router.push("/settings/addDisease")}
              style={styles.plusWrapper}
            >
              <Text style={styles.plusText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.listContainer}>
            {[
              diseasesData.length === 0
                ? { id: "default", name: "No diseases" }
                : null,
              ...diseasesData,
            ]?.map((disease) => {
              if (!disease) return null;
              return (
                <View style={styles.infoContent}>
                  <Text style={styles.infoText} key={disease.id}>
                    {disease.name}
                  </Text>
                  {isPending ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Pressable onPress={() => deleteDisease(disease.id)}>
                      <Entypo name="cross" size={30} color="#0D9488" />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  imageContainer: {
    alignItems: "flex-end",
    marginBottom: 45,
  },
  image: {
    width: 114,
    height: 114,
  },
  dataContainer: {
    marginTop: 120,
  },
  text: {
    marginTop: 50,
    color: "#0D9488",
    textAlign: "center",
    marginBottom: 50,
  },
  infoWrapper: {
    marginBottom: 30,
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
    color: "#0D9488",
    marginBottom: 25,
  },
  infoHeaderText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "bold",
  },
  infoContent: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
    borderRadius: 25,
  },
  infoText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "light",
  },
  plusWrapper: {
    backgroundColor: "#0D9488",
    width: 55,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    fontSize: 25,
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#EBF1F5",
  },
  listContainer: {
    gap: 10,
  },
});
