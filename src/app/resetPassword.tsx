import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useNavigation } from "expo-router";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type SignUpFormData = {
  email: string;
};

export default function ResetPassword() {
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 13 }}>
        <Title>Reset Password</Title>
      </View>
      <View style={{ marginBottom: 70 }}>
        <AppText>
          Enter your email address and we will send you a verification code to
          reset your password
        </AppText>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
        </View>
      </View>

      <AppButton
        containerStyle={{ marginTop: 27 }}
        type="primary"
        onPress={handleSubmit(onSubmit)}
      >
        Send code
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
