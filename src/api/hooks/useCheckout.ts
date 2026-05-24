import { useMutation } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";
const monthslyPriceId = "price_1RpuzoC1kCMVK5zzyvDmEdY5";

import * as Linking from "expo-linking";

const successUrl = Linking.createURL("/subscription/success");
const failureUrl = Linking.createURL("/subscription/cancel");

export type CheckoutResponse = {
  url: string;
};

export const checkout = async (): Promise<CheckoutResponse> => {
  const res = await axiosInstance.post(
    `/subscriptions/checkout/${monthslyPriceId}`,
    { failureUrl: failureUrl, successUrl: successUrl },
  );
  return res.data;
};

export const useCheckout = () => {
  return useMutation<CheckoutResponse, ServerError>({
    mutationKey: ["checkout"],
    mutationFn: checkout,
    onSuccess: async (data) => {
      await WebBrowser.openBrowserAsync(data.url);
    },
  });
};
