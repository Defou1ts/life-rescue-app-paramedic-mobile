import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export type SendKYCData = {
  identityDocument: string;
  selfie: string;
  licence: string;
};

export const useSendKYC = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["sendKYC"],
    mutationFn: async (data: SendKYCData) => {
      const formData = new FormData();

      formData.append("IdentityDocument", {
        uri: data.identityDocument,
        name: "identity-document.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("Selfie", {
        uri: data.selfie,
        name: "selfie.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("CertificationDocument", {
        uri: data.licence,
        name: "licence.jpg",
        type: "image/jpeg",
      } as any);
      return axiosInstance.post("/job-application", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess(t) {
      Toast.show({
        type: "success",
        text1: "KYC sent successfully",
      });

      router.replace("/settings");
    },
    onError() {
      Toast.show({ type: "error", text1: "You have already sent KYC" });
      router.replace("/settings");
    },
  });
};
