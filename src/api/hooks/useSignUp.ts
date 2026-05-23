import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type SignUpRequestData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const signUp = async (data: SignUpRequestData): Promise<number> => {
  const res = await axiosInstance.post("/accounts", data);
  return res.data;
};

export const useSignUp = () => {
  const router = useRouter();

  return useMutation<number, ServerError, SignUpRequestData>({
    mutationKey: ["sign-in"],
    mutationFn: signUp,
    onSuccess: (data, variables) => {
      router.push({
        pathname: "/verify/[email]",
        params: { email: variables.email },
      });
    },
  });
};
