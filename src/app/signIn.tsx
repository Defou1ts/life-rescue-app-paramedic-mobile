import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type SignInFormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 70 }}>
        <Title>Welcome Back</Title>
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

        <View>
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Password"
                secure
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}
        </View>
        <UnderlinedButton fontWeight="regular" style={{ marginTop: 20 }}>
          Forgot Password?
        </UnderlinedButton>
      </View>

      <AppButton
        containerStyle={{ marginTop: 27 }}
        type="primary"
        onPress={handleSubmit(onSubmit)}
      >
        Log In
      </AppButton>
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
