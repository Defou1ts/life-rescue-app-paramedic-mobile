import { useProfile } from "@/api/hooks/useProfile";
import { Input } from "@/components/input";
import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const Logo = require("@/assets/images/logo.png");

export default function PRofile() {
  const { data, isLoading, refetch } = useProfile();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <View style={styles.dataContainer}>
        {data.name && data.lastName && (
          <Input value={data.name + " " + data.lastName} />
        )}
        {data.email && <Input value={data.email} />}
        {data.phoneNumber && <Input value={data.phoneNumber} />}
        {data.isTwoFactorEnabled && (
          <Text style={styles.text}>2FA Enabled</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {},
  image: {
    width: 274,
    height: 274,
  },
  dataContainer: {
    marginTop: 120,
    width: "80%",
  },
  text: {
    marginTop: 50,
    color: "#0D9488",
    textAlign: "center",
    marginBottom: 50,
  },
  infoWrapper: {
    marginBottom: 30,
    borderRadius: 45,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    padding: 20,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#0D9488",
  },
  infoHeaderText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "bold",
  },
  infoContent: {
    paddingVertical: 18,
    paddingHorizontal: 12,

    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
    borderRadius: 25,
  },
  infoText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "light",
  },
});
