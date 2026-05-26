import { AppButton } from "@/components/button";
import { Title } from "@/components/Title";

import { axiosInstance } from "@/api/axiosInstance";
import {
  CreateEmergencyRequest,
  useCreateEmergency,
} from "@/api/hooks/useCreateEmergency";
import { useGetAnswersByQuestionId } from "@/api/hooks/useGetAnswersByQuestionId";
import { useGetRootEmergencyQuestion } from "@/api/hooks/useGetRootEmergencyQuestion";

import * as Location from "expo-location";
import { router, useNavigation } from "expo-router";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Question } from "@/api/hooks/useGetQuestionByAnswerId";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type HistoryItem = {
  question: Question;
  selectedAnswerId: string;
};

export default function Request() {
  const navigation = useNavigation();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isNavigating, setIsNavigating] = useState(false);

  const [isCreatingEmergency, setIsCreatingEmergency] = useState(false);

  const {
    data: rootQuestion,
    isLoading: isRootLoading,
    error: rootError,
  } = useGetRootEmergencyQuestion();

  const { mutateAsync: createEmergency } = useCreateEmergency();
  console.log(currentQuestion);
  /**
   * init root question
   */
  useEffect(() => {
    if (rootQuestion) {
      setCurrentQuestion(rootQuestion);
    }
  }, [rootQuestion]);

  /**
   * get location
   */
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.log("LOCATION_ERROR", error);
      }
    };

    loadLocation();
  }, []);

  /**
   * answers query
   */
  const {
    data: answers,
    isLoading: isAnswersLoading,
    error: answersError,
  } = useGetAnswersByQuestionId(currentQuestion?.id ?? "", {
    enabled: !!currentQuestion?.id,
  });

  /**
   * android back handler
   */
  useEffect(() => {
    const onBackPress = () => {
      if (history.length > 0) {
        const previous = history[history.length - 1];

        setCurrentQuestion(previous.question);

        setSelectedAnswerId(previous.selectedAnswerId);

        setHistory((prev) => prev.slice(0, -1));

        return true;
      }

      navigation.goBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [history]);

  const selectedAnswer = useMemo(() => {
    return answers?.find((answer) => answer.id === selectedAnswerId);
  }, [answers, selectedAnswerId]);

  const handleCreateEmergency = async () => {
    if (!currentQuestion || !selectedAnswerId || isNavigating) {
      return;
    }
    try {
      setIsCreatingEmergency(true);

      const questionIds = [
        ...history.map((item) => item.question.id),
        currentQuestion.id,
      ];

      const answerOptionsIds = [
        ...history.map((item) => item.selectedAnswerId),
        selectedAnswerId,
      ];

      const payload: CreateEmergencyRequest = {
        initiatorLatitude: location?.latitude ?? 0,

        initiatorLongitude: location?.longitude ?? 0,

        questionIds,
        answerOptionsIds: answerOptionsIds ?? [],
      };

      await createEmergency(payload);

      Alert.alert("Emergency Created", "Help request successfully sent");

      router.replace("/(tabs)");
    } catch (createError) {
      console.log("CREATE_EMERGENCY_ERROR", createError);

      Alert.alert("Error", "Failed to create emergency request");
    } finally {
      setIsCreatingEmergency(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (!currentQuestion || !selectedAnswerId || isNavigating) {
      return;
    }

    try {
      setIsNavigating(true);

      const updatedHistory = [
        ...history,
        {
          question: currentQuestion,
          selectedAnswerId,
        },
      ];

      /**
       * try get next question
       */
      const response = await axiosInstance.get<Question>(
        `/symptom/questions/${selectedAnswerId}`,
      );

      setHistory(updatedHistory);

      setCurrentQuestion(response.data);

      setSelectedAnswerId(null);
    } catch (error: any) {
      /**
       * 404 = end of tree
       */
      if (error?.response?.status === 404) {
        await handleCreateEmergency();
        return;
      }

      console.log("NEXT_QUESTION_ERROR", error);

      Alert.alert("Error", "Failed to load next question");
    } finally {
      setIsNavigating(false);
    }
  }, [
    currentQuestion,
    selectedAnswerId,
    history,
    location,
    createEmergency,
    isNavigating,
  ]);

  /**
   * loading states
   */
  if (isRootLoading || !currentQuestion || isAnswersLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  /**
   * error states
   */
  if (rootError || answersError) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>
          Failed to load emergency questionnaire
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title>{currentQuestion.text}</Title>

      <FlatList
        data={answers ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedAnswerId;

          return (
            <View style={styles.cardWrapper}>
              <Pressable
                onPress={() => setSelectedAnswerId(item.id)}
                style={[styles.card, isSelected && styles.selectedCard]}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.selectedCardText,
                  ]}
                >
                  {item.text}
                </Text>

                {!!item.instructionText && (
                  <Text
                    style={[
                      styles.instructionText,
                      isSelected && styles.selectedInstructionText,
                    ]}
                  >
                    {item.instructionText}
                  </Text>
                )}

                {!!item.animationKey?.base64Content && (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${item.animationKey.base64Content}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
              </Pressable>
            </View>
          );
        }}
      />

      <View style={styles.buttonsWrapper}>
        <AppButton
          type="primary"
          disabled={!selectedAnswerId || isNavigating || isCreatingEmergency}
          onPress={handleNext}
          containerStyle={{
            marginTop: 20,
          }}
        >
          {isCreatingEmergency ? "Creating..." : "Continue"}
        </AppButton>
        <AppButton
          onPress={handleCreateEmergency}
          containerStyle={{ marginTop: 20, backgroundColor: " #F59E0B" }}
          type="primary"
        >
          Request Help
        </AppButton>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 70,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },

  cardWrapper: {
    paddingHorizontal: 37,
    marginVertical: 12,
  },

  card: {
    paddingVertical: 22,
    paddingHorizontal: 20,

    minHeight: 71,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EBF1F5",

    borderRadius: 40,

    shadowColor: "#000",

    shadowOffset: {
      width: 4,
      height: 4,
    },

    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },

  selectedCard: {
    backgroundColor: "#0D9488",
  },

  cardText: {
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "400",
    color: "#0D9488",
    textAlign: "center",
  },

  selectedCardText: {
    color: "#FFFFFF",
  },

  instructionText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  selectedInstructionText: {
    color: "#E2E8F0",
  },

  image: {
    width: 150,
    height: 150,
    marginTop: 15,
  },

  buttonsWrapper: {
    paddingHorizontal: 85,
  },
});
