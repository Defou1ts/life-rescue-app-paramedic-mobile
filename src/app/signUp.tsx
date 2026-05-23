import { useSignUp } from "@/api/hooks/useSignUp";
import { AppButton } from "@/components/button";
import { ErrorLoading } from "@/components/error";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";

import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import * as yup from "yup";

// Схема валидации
const signUpSchema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

export default function SignUp() {
  const { data, mutate, isPending, isError, isSuccess, error } = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormData) => {
    mutate(data);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 70 }}>
        <Title>Create Account</Title>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="email"
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

        <View>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirm Password"
                secure
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>
      </View>

      {isPending && <Loading />}
      {isError && <ErrorLoading>{error.Details.Errors.Email[0]}</ErrorLoading>}

      <AppButton
        containerStyle={{ marginTop: 27 }}
        type="primary"
        onPress={handleSubmit(onSubmit)}
      >
        Sign Up
      </AppButton>

      <UnderlinedButton fontWeight="bold" style={{ marginTop: 20 }}>
        Go back
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
