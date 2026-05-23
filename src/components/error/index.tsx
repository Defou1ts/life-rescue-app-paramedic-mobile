import { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  children: ReactNode;
};

export const ErrorLoading = ({ children }: Props) => {
  return <Text>{children}</Text>;
};

export const styles = StyleSheet.create({
  error: {
    color: "red",
    fontFamily: "Inter",
  },
});
