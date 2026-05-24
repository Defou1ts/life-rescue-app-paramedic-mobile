import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type Request = {
  latitude: number;
  longitude: number;
};

export type Response = Array<{
  latitude: number;
  longitude: number;
}>;

export const useParamedicsNearby = () => {
  return useMutation<Response, ServerError, Request>({
    mutationKey: ["paramedicsNearby"],
    mutationFn: async (data) => {
      const res = await axiosInstance.post<Response>(
        "/emergency/paramedics",
        data,
      );
      return res.data;
    },
  });
};
