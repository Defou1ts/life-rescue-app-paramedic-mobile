import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";
import { AxiosResponse } from "axios";

export type SignInRequestData = {
  email: string;
  password: string;
  token?: string;
};

export const signIn = async (data:SignInRequestData)=> {
  const res = await axiosInstance.post("/auth/login", data);
  return res
};

export const useSignIn = () => {
  const router = useRouter();

  return useMutation<AxiosResponse, ServerError, SignInRequestData>({
    mutationKey: ["sign-in"],
    mutationFn: signIn,
    onSuccess: (data, variables,onMutateResult) => {
      if (onMutateResult instanceof AxiosResponse) {
      router.push({
        pathname: "/verify/[email]",
        params: { email: variables.email },
      });
      }


    },
  });
};
