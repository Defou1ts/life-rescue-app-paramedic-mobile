import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useNavigation } from "expo-router";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type NewPsswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

export default function NewPassword() {
  const navigation = useNavigation();
  const email = "email@mail.ru";
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPsswordFormData>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: NewPsswordFormData) => {
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 70 }}>
        <Title>New Password</Title>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="newPassword"
            rules={{
              required: "New Password is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="New Password"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          {errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword.message}</Text>
          )}
        </View>
        <View>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: "Confirm password is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          {errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword.message}</Text>
          )}
        </View>
      </View>

      <AppButton
        containerStyle={{ marginTop: 27 }}
        type="primary"
        onPress={handleSubmit(onSubmit)}
      >
        Update Password
      </AppButton>

      <UnderlinedButton
        onPress={() => {
          navigation.goBack();
        }}
        fontWeight="bold"
        style={{ marginTop: 20 }}
      >
        Back to Log In
      </UnderlinedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    justifyContent: "center",
  },

  inputsContainer: {
    gap: 36,
    marginBottom: 70,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
});
