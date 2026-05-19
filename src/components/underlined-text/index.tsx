import { PRIMARY_COLOR } from "@/contants/colors";
import { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  fontWeight: "regular" | "bold";
};

export const UnderlinedButton = ({
  children,
  onPress,
  style,
  fontWeight,
}: Props) => {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <Text style={{ ...styles.text, fontWeight }}>{children}</Text>
    </TouchableOpacity>
  );
};

export const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: "700",
    textDecorationLine: "underline",
    fontFamily: "Inter",
  },
});
