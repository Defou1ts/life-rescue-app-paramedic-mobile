import { PRIMARY_COLOR } from "@/contants/colors";
import { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  children: ReactNode;
};

export const AppText = (props: Props) => {
  return <Text style={styles.text}>{props.children}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "400",
    color: PRIMARY_COLOR,
    textAlign: "center",
    fontFamily: "Inter",
  },
});
