import { PRIMARY_COLOR } from "@/contants/colors";
import { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  children: ReactNode;
};

export const Title = (props: Props) => {
  return <Text style={styles.title}>{props.children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 35,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    textAlign: "center",
    fontFamily: "Inter",
  },
});
