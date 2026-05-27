import { Stack } from "expo-router";

import "react-native-gesture-handler";

export const SETTINGS_SCREEN_NAMES = {
  INDEX: "index",
  EDIT_PROFILE: "editProfile",
  CHANGE_PASSWORD: "changePassword",
  CHANGE_EMAIL: "changeEmail",
} as const;

export default function SettingsLayout() {
  return (
    <Stack
      initialRouteName={SETTINGS_SCREEN_NAMES.INDEX}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#EBF1F5" },
      }}
    >
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.INDEX}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.EDIT_PROFILE}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.CHANGE_PASSWORD}
        options={{ title: "Change Password" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.CHANGE_EMAIL}
        options={{ title: "Change  Email" }}
      />
    </Stack>
  );
}
