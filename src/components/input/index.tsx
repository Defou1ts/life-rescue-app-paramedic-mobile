import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
type InputProps = TextInputProps & {
  secure?: boolean;
};

export const Input = ({ secure = false, ...props }: InputProps) => {
  const [isSecure, setIsSecure] = useState(secure);

  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor="#0D9488"
        secureTextEntry={isSecure}
        style={styles.input}
        {...props}
      />

      {secure && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsSecure((prev) => !prev)}
          style={styles.iconContainer}
        >
          <Ionicons
            name={isSecure ? "eye-outline" : "eye-off-outline"}
            size={28}
            color="#0D9488"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    borderBottomColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },

  input: {
    flex: 1,
    fontSize: 20,
    color: "#0D9488",
    paddingVertical: 6,
  },

  iconContainer: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
