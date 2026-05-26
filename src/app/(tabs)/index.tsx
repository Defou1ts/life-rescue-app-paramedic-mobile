import { useGetActiveEmergencyRequest } from "@/api/hooks/useGetActiveEmergencyRequest";
import { AppText } from "@/components/app-text";
import { EmergencyMap } from "@/components/emergency-map";
import { LoadingScreen } from "@/components/loading-screen";
import { StyleSheet, View } from "react-native";

export default function Home() {
  const { isPending: isLoadingActiveEmergencyRequest } =
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

  /**
   * MODAL STYLES
   */

  modal: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 10,
    color: "#0D9488",
    fontFamily: "Inter",
  },

  option: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 250,
    backgroundColor: "#EBF1F5",
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  optionText: {
    color: "#0D9488",
    fontSize: 25,
    fontFamily: "Inter",
    fontWeight: 300,
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },

  selected: {
    backgroundColor: "#0D9488",
  },
  closeIcon: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF1F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,

    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  closeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0D9488",
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  sheetTitle: {
    fontSize: 28,
    fontFamily: "Inter",
    fontWeight: "500",
    color: "#0D9488",
    flex: 1,
    textAlign: "center",
  },

  closeButton: {
    fontSize: 28,
    color: "#0D9488",
  },

  backButton: {
    fontSize: 28,
    color: "#0D9488",
  },

  answerPill: {
    backgroundColor: "#EBF1F5",

    borderRadius: 28,

    paddingVertical: 18,
    paddingHorizontal: 20,

    marginBottom: 14,

    shadowColor: "#000",

    shadowOffset: {
      width: 2,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 5,

    elevation: 3,
  },

  answerPillSelected: {
    backgroundColor: "#CDE7E5",
  },

  answerText: {
    color: "#0D9488",
    fontSize: 24,
    fontFamily: "Inter",
    fontWeight: "300",
  },

  answerTextSelected: {
    color: "#0D9488",
  },
  ratingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  ratingModal: {
    width: "100%",

    backgroundColor: "#F1F5F9",

    borderRadius: 40,

    paddingHorizontal: 28,

    paddingTop: 28,

    paddingBottom: 40,

    alignItems: "center",
  },

  ratingCloseButton: {
    position: "absolute",

    right: 20,

    top: 20,

    zIndex: 5,
  },

  ratingCloseText: {
    fontSize: 36,

    color: "#0D9488",
  },

  ratingTitle: {
    fontSize: 48,

    lineHeight: 52,

    textAlign: "center",

    color: "#0D9488",

    fontWeight: "700",

    marginTop: 40,
  },

  ratingCard: {
    width: "100%",

    backgroundColor: "#E2E8F0",

    borderRadius: 40,

    marginTop: 40,

    padding: 20,

    shadowColor: "#000",

    shadowOffset: {
      width: 4,
      height: 4,
    },

    shadowOpacity: 0.15,

    shadowRadius: 10,

    elevation: 6,
  },

  starsContainer: {
    flexDirection: "row",

    justifyContent: "center",

    marginBottom: 20,
  },

  star: {
    fontSize: 48,

    color: "#CBD5E1",

    marginHorizontal: 4,
  },

  selectedStar: {
    color: "#FACC15",
  },

  feedbackInput: {
    backgroundColor: "#CBD5E1",

    borderRadius: 18,

    minHeight: 70,

    paddingHorizontal: 16,

    paddingVertical: 14,

    fontSize: 18,

    color: "#111827",
  },
});
