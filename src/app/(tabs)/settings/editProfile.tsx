"use no memo";

import { useProfile, type ProfileResponse } from "@/api/hooks/useProfile";
import { useUpdateProfile } from "@/api/hooks/useUpdateProfile";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import * as yup from "yup";

const schema = yup.object({
  fullName: yup
    .string()
    .test("full-name", "Enter first and last name", (value) => {
      if (!value) return false;

      const parts = value.trim().split(" ");

      return parts.length >= 2;
    })
    .required("Full name is required"),

  phoneNumber: yup.string().required("Phone number is required"),

  isTwoFactorEnabled: yup.boolean().required(),
});

type FormValues = yup.InferType<typeof schema>;

function profileToFormValues(profile: ProfileResponse): FormValues {
  return {
    fullName: `${profile.name} ${profile.lastName}`.trim(),
    phoneNumber: profile.phoneNumber ?? "",
    isTwoFactorEnabled: Boolean(profile.isTwoFactorEnabled),
  };
}

type EditProfileFormProps = {
  profile: ProfileResponse;
};

function EditProfileForm({ profile }: EditProfileFormProps) {
  const { mutate, isPending } = useUpdateProfile();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: profileToFormValues(profile),
  });

  const fullName = watch("fullName");
  const phoneNumber = watch("phoneNumber");
  const isTwoFactorEnabled = watch("isTwoFactorEnabled");

  const onSubmit = (values: FormValues) => {
    const [firstName, ...rest] = values.fullName.trim().split(" ");

    const lastName = rest.join(" ");

    mutate({
      firstName,
      lastName,
      phoneNumber: values.phoneNumber,
      isTwoFactorEnabled: values.isTwoFactorEnabled,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.inputsWrapper}>
          <View>
            <Input
              editable={false}
              value={profile.email ?? ""}
              placeholder="Enter Email"
            />
          </View>

          <View>
            <Input
              value={fullName}
              onChangeText={(text) =>
                setValue("fullName", text, { shouldDirty: true })
              }
              placeholder="Enter First Name and Last Name"
            />
            {errors.fullName && (
              <Text style={styles.error}>{errors.fullName.message}</Text>
            )}
          </View>

          <View>
            <Input
              value={phoneNumber}
              onChangeText={(text) =>
                setValue("phoneNumber", text, { shouldDirty: true })
              }
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && (
              <Text style={styles.error}>{errors.phoneNumber.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.switchWrapper}>
          <AppText>Two Factor Authentication</AppText>
          <Switch
            value={isTwoFactorEnabled}
            onValueChange={(next) =>
              setValue("isTwoFactorEnabled", next, { shouldDirty: true })
            }
            trackColor={{ true: "#66B9B4", false: "#DFE5E9" }}
            thumbColor={isTwoFactorEnabled ? "#098E89" : "#66B9B4"}
          />
        </View>

        <AppButton
          containerStyle={styles.save}
          type="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </AppButton>
      </View>
    </View>
  );
}

export default function EditProfile() {
  const { data, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return <EditProfileForm key={data.email} profile={data} />;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  contentWrapper: {
    width: "80%",
  },

  inputsWrapper: {
    gap: 24,
    marginBottom: 32,
  },

  switchWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    marginTop: 8,
  },

  kyc: {
    backgroundColor: "#F59E0B",
  },

  save: {
    marginTop: 50,
  },

  error: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
});
