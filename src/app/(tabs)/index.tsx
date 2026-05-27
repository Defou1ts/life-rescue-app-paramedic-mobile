import { useGetActiveEmergencyRequest } from "@/api/hooks/useGetActiveEmergencyRequest";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { EmergencyMap } from "@/components/emergency-map";
import { LoadingScreen } from "@/components/loading-screen";
import { StyleSheet, View } from "react-native";

export default function Home() {
  const { isPending: isLoadingActiveEmergencyRequest, data } =
    useGetActiveEmergencyRequest();

  if (isLoadingActiveEmergencyRequest) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View>
          <View style={styles.medicsContainer}>
            <View style={styles.medics} />

            <AppText>Active</AppText>
          </View>

          <View style={styles.imageContainer}>
            <EmergencyMap />
          </View>
        </View>
      </View>
      <AppButton
        containerStyle={styles.button}
        type="primary"
        disabled={data === undefined}
      >
        Active Emergency
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    justifyContent: "center",
  },

  imageContainer: {
    width: 250,
    height: 188,
  },

  image: {
    width: 250,
    height: 188,
    borderRadius: 24,
  },

  mapContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 45,
    alignItems: "center",
    gap: 9,
    marginBottom: 25,
  },

  medicsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 9,
  },

  medics: {
    width: 16,
    height: 16,
    backgroundColor: "#7CEA76",
    borderRadius: 45,
  },

  button: {
    marginTop: 120,
  },
});
