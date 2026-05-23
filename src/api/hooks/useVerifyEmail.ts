import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type VerifyEmailRequestData = {
  email: string;
  token: string;
};

export const verifyEmail = async (
  data: VerifyEmailRequestData,
): Promise<number> => {
  const res = await axiosInstance.post(
    `/accounts/verification?email=${data.email}&token=${data.token}`,
  );
  return res.data;
};

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation<number, ServerError, VerifyEmailRequestData>({
    mutationKey: ["verify-email"],
    mutationFn: verifyEmail,
    onSuccess: () => {
      router.push({
        pathname: "/signIn",
      });

      Toast.show({
        type: "success",
        text1: "Successfully verified Email! Log In now",
      });
    },
  });
};
