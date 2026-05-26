import { axiosInstance } from "@/api/axiosInstance";
import { useRateEmergency } from "@/api/hooks/RateEmergencyRequest";
import { useCheckout } from "@/api/hooks/useCheckout";
import { useGetActiveEmergencyRequest } from "@/api/hooks/useGetActiveEmergencyRequest";
import { useGetAnswersByQuestionId } from "@/api/hooks/useGetAnswersByQuestionId";
import { Question } from "@/api/hooks/useGetQuestionByAnswerId";
import { useGetRootEmergencyQuestion } from "@/api/hooks/useGetRootEmergencyQuestion";
import { useHasSubscription } from "@/api/hooks/useHasSubcription";
import { useParamedicsNearby } from "@/api/hooks/useParamedicsNeaby";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { EmergencyMap } from "@/components/emergency-map";
import { Loading } from "@/components/loading";
import { LoadingScreen } from "@/components/loading-screen";
import { Title } from "@/components/Title";
import { signalRService } from "@/services/signalr";
import { extractEmergencySelections } from "@/utils/emergency";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/**
 * MOCK DATA (потом заменишь на API)
 */
const MAIN_ISSUES = [
  { id: "injury", name: "Injury or Trauma" },
  { id: "breathing", name: "Difficulty Breathing" },
  { id: "allergy", name: "Allergic Reaction" },
  { id: "chest", name: "Chest Pain / Heart Issue" },
  { id: "unconscious", name: "Unconscious" },
  { id: "other", name: "Other" },
];

const SYMPTOMS = [
  { id: "bleeding", name: "Heavy bleeding" },
  { id: "pain", name: "Severe pain" },
  { id: "breath", name: "Difficulty breathing" },
  { id: "dizzy", name: "Dizziness or confusion" },
  { id: "weakness", name: "Numbness or weakness" },
];

const CONDITIONS = [
  { id: "allergy", name: "Drug Allergies" },
  { id: "heart", name: "Heart Disease" },
  { id: "diabetes", name: "Diabetes" },
  { id: "asthma", name: "Asthma or Lung Disease" },
  { id: "pregnancy", name: "Pregnancy" },
  { id: "none", name: "None or Unknown" },
];

const MEDICS = [
  {
    latitude: 52.2299,
    longitude: 21.0122,
  },
  {
    latitude: 52.2315,
    longitude: 21.0151,
  },
  {
    latitude: 52.2281,
    longitude: 21.0088,
  },
];

type FormValues = {
  mainIssue: string | null;
  symptoms: string[];
  conditions: string[];
};

export default function Home() {
  const { data: subscriptionData, isLoading: isHasSubscriptionLoading } =
    useHasSubscription();

  const { data: paramedicsNearby, isPending: isLoadingParamedicsNearby } =
    useParamedicsNearby();

  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  const [rating, setRating] = useState(0);

  const [feedback, setFeedback] = useState("");

  const [finishedEmergencyId, setFinishedEmergencyId] = useState<string | null>(
    null,
  );

  const { mutateAsync: rateEmergency, isPending: isRatingLoading } =
    useRateEmergency();

  useEffect(() => {
    signalRService.onReceiveFinishedEmergency = (message) => {
      /**
       * message:
       * Emergency 019e65b7-e1a2-7801-ba3a-08b07a08c4eb finished
       */

      const match = message.match(/Emergency\s(.+)\sfinished/);

      const emergencyId = match?.[1];

      if (!emergencyId) {
        return;
      }

      setFinishedEmergencyId(emergencyId);

      setRatingModalVisible(true);
    };

    return () => {
      signalRService.onReceiveFinishedEmergency = null;
    };
  }, []);

  const { data: rootEmergencyQuestion } = useGetRootEmergencyQuestion();
  const sheetRef = useRef<BottomSheet>(null);
  const {
    data: activeEmergencyRequest,
    isPending: isLoadingActiveEmergencyRequest,
  } = useGetActiveEmergencyRequest();

  console.log(activeEmergencyRequest);

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [history, setHistory] = useState<
    {
      question: Question;
      answerId: string;
    }[]
  >([]);

  const { data: answers, isLoading: isLoadingAnswers } =
    useGetAnswersByQuestionId(currentQuestion?.id ?? "", {
      enabled: !!currentQuestion?.id,
    });

  const handleRateEmergency = async () => {
    if (!finishedEmergencyId || !rating) {
      return;
    }

    try {
      await rateEmergency({
        emergencyId: finishedEmergencyId,

        feedBack: feedback,

        rate: rating,
      });

      setRatingModalVisible(false);

      setRating(0);

      setFeedback("");

      setFinishedEmergencyId(null);
    } catch (error) {
      console.log("RATE_EMERGENCY_ERROR", error);
    }
  };

  const { mutate, isPending } = useCheckout();

  const [modalVisible, setModalVisible] = useState(false);

  const { watch, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      mainIssue: "injury",
      symptoms: ["pain", "breath"],
      conditions: ["none"],
    },
  });

  const values = watch();

  if (
    isHasSubscriptionLoading ||
    !subscriptionData ||
    isLoadingActiveEmergencyRequest
  ) {
    return <LoadingScreen />;
  }
  const toggleMulti = (field: "symptoms" | "conditions", id: string) => {
    const current = values[field] || [];

    if (current.includes(id)) {
      setValue(
        field,
        current.filter((x) => x !== id),
      );
    } else {
      setValue(field, [...current, id]);
    }
  };

  const onSave = (data: FormValues) => {
    setModalVisible(false);

    // API:
    // await api.updateEmergency(data)
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <View>
          <View style={styles.medicsContainer}>
            <View style={styles.medics} />

            <AppText>
              {activeEmergencyRequest ? (
                "Arriving in 5-8 min"
              ) : isLoadingParamedicsNearby ? (
                <ActivityIndicator size="small" color="#0D9488" />
              ) : (
                `${paramedicsNearby?.length || 0} Medics nearby`
              )}
            </AppText>
          </View>

          <View style={styles.imageContainer}>
            <EmergencyMap />
          </View>
        </View>
      </View>

      {/* ACTIVE REQUEST */}
      {subscriptionData?.hasActiveSubscription ? (
        activeEmergencyRequest ? (
          <View>
            <AppButton
              type="outline"
              containerStyle={{ marginTop: 27 }}
              onPress={() => {
                /**
                 * existing symptom tree
                 */
                const existingRoot = activeEmergencyRequest?.symptomTree?.[0];

                if (existingRoot) {
                  setCurrentQuestion({
                    id: existingRoot.questionId,
                    text: existingRoot.questionText,
                    questionType: "Single",
                    parentAnswerId: "",
                  });

                  setHistory([]);

                  setSelectedAnswerId(null);

                  sheetRef.current?.expand();

                  return;
                }

                /**
                 * empty symptom tree
                 * start questionnaire from scratch
                 */
                if (rootEmergencyQuestion) {
                  setCurrentQuestion(rootEmergencyQuestion);

                  setHistory([]);

                  setSelectedAnswerId(null);

                  sheetRef.current?.expand();
                }
              }}
            >
              Update Symptoms
            </AppButton>
            <BottomSheet
              ref={sheetRef}
              index={-1}
              snapPoints={["70%", "95%"]}
              enablePanDownToClose
              backgroundStyle={{
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                backgroundColor: "#F8FAFC",
              }}
              handleIndicatorStyle={{
                backgroundColor: "#CBD5E1",
                width: 80,
              }}
            >
              <BottomSheetView style={styles.sheetContainer}>
                {/* HEADER */}
                <View style={styles.sheetHeader}>
                  {history.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        const previous = history[history.length - 1];

                        setCurrentQuestion(previous.question);

                        setSelectedAnswerId(previous.answerId);

                        setHistory((prev) => prev.slice(0, -1));
                      }}
                    >
                      <Text style={styles.backButton}>↩</Text>
                    </Pressable>
                  ) : (
                    <View style={{ width: 24 }} />
                  )}

                  <Text style={styles.sheetTitle}>{currentQuestion?.text}</Text>

                  <Pressable onPress={() => sheetRef.current?.close()}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                {/* ANSWERS */}
                <FlatList
                  data={answers ?? []}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingBottom: 40,
                  }}
                  renderItem={({ item }) => {
                    const isSelected = selectedAnswerId === item.id;

                    return (
                      <Pressable
                        onPress={() => setSelectedAnswerId(item.id)}
                        style={[
                          styles.answerPill,
                          isSelected && styles.answerPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.answerText,
                            isSelected && styles.answerTextSelected,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </Pressable>
                    );
                  }}
                />

                <AppButton
                  disabled={!selectedAnswerId}
                  type="primary"
                  onPress={async () => {
                    if (!selectedAnswerId || !currentQuestion) {
                      return;
                    }

                    try {
                      const updatedHistory = [
                        ...history,
                        {
                          question: currentQuestion,
                          answerId: selectedAnswerId,
                        },
                      ];

                      const response = await axiosInstance.get<Question>(
                        `/symptom/questions/${selectedAnswerId}`,
                      );

                      setHistory(updatedHistory);

                      setCurrentQuestion(response.data);

                      setSelectedAnswerId(null);
                    } catch (error: any) {
                      /**
                       * END OF TREE
                       */
                      if (error?.response?.status === 404) {
                        const hasExistingTree =
                          activeEmergencyRequest?.symptomTree?.length;

                        const existingSelections = hasExistingTree
                          ? extractEmergencySelections(activeEmergencyRequest!)
                          : {
                              questionIds: [],
                              answerIds: [],
                            };

                        const updatedQuestionIds = [
                          ...existingSelections.questionIds,

                          ...history.map((item) => item.question.id),

                          currentQuestion.id,
                        ];

                        const updatedAnswerIds = [
                          ...existingSelections.answerIds,

                          ...history.map((item) => item.answerId),

                          selectedAnswerId,
                        ];

                        await signalRService.sendEmergencyUpdate({
                          initiatorLocation: {
                            latitude:
                              activeEmergencyRequest.initiatorLocation.latitude,

                            longitude:
                              activeEmergencyRequest.initiatorLocation
                                .longitude,
                          },

                          symptomQuestionsIds: updatedQuestionIds,

                          symptomAnswerOptionsIds: updatedAnswerIds,
                        });

                        sheetRef.current?.close();

                        return;
                      }
                    }
                  }}
                  containerStyle={{
                    marginTop: 10,
                    marginBottom: 20,
                  }}
                >
                  Update
                </AppButton>
              </BottomSheetView>
            </BottomSheet>
          </View>
        ) : (
          <View>
            <AppButton containerStyle={{ marginTop: 27 }} type="primary">
              Recent Requests
            </AppButton>

            <AppButton
              onPress={() => router.navigate("/request")}
              containerStyle={{ marginTop: 27 }}
              type="outline"
            >
              Emergency Help
            </AppButton>
          </View>
        )
      ) : (
        <View>
          <View style={{ marginBottom: 15 }}>
            <Title>Activate Emergency Services</Title>
          </View>

          <View style={{ marginBottom: 30 }}>
            <AppText>
              Subscribe now to get 24/7 access to professional medical help in
              your area
            </AppText>
          </View>

          {isPending && <Loading />}
          <AppButton
            disabled={isPending}
            onPress={mutate}
            containerStyle={{ marginTop: 27 }}
            type="primary"
          >
            Join Now
          </AppButton>
        </View>
      )}

      {/* MODAL */}
      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.ratingOverlay}>
          <View style={styles.ratingModal}>
            <Pressable
              style={styles.ratingCloseButton}
              onPress={() => setRatingModalVisible(false)}
            >
              <Text style={styles.ratingCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.ratingTitle}>Rate Your{"\n"}Experience</Text>

            <View style={styles.ratingCard}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const selected = star <= rating;

                  return (
                    <Pressable key={star} onPress={() => setRating(star)}>
                      <Text
                        style={[styles.star, selected && styles.selectedStar]}
                      >
                        ★
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Share your thoughts..."
                placeholderTextColor="#6B7280"
                multiline
                style={styles.feedbackInput}
              />
            </View>

            <AppButton
              type="primary"
              disabled={!rating || isRatingLoading}
              onPress={handleRateEmergency}
              containerStyle={{
                marginTop: 35,
              }}
            >
              Submit
            </AppButton>
          </View>
        </View>
      </Modal>
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
