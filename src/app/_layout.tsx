import { queryClient } from "@/config/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";

if (__DEV__) {
  LogBox.ignoreAllLogs();
}
export const ROOT_SCREEN_NAMES = {
  INDEX: "index",
  SIGN_IN: "signIn",
  RESET_PASSWORD: "resetPassword",
  NEW_PASSWORD: "newPassword",
  TABS: "(tabs)",
} as const;

export default function RootLayout() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Stack
          initialRouteName={ROOT_SCREEN_NAMES.INDEX}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#EBF1F5" },
          }}
        >
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.INDEX}
            options={{ title: "Home" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SIGN_IN}
            options={{ title: "SignIn" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.RESET_PASSWORD}
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.NEW_PASSWORD}
            options={{ title: "New Password" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.TABS}
            options={{ headerShown: false }}
          />
        </Stack>
      </QueryClientProvider>
      <Toast />
    </>
  );
}
