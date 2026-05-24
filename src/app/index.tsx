import { AppButton } from "@/components/button";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/hooks/useAuth";
import { Image } from "expo-image";
import { Redirect, useNavigation } from "expo-router";
import { StyleSheet, View } from "react-native";
const Logo = require("@/assets/images/logo.png");
export default function Index() {
  const { isAuthorized, isLoading } = useAuth();
  const navigation = useNavigation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthorized) {
    return <Redirect href="/(tabs)" />;
  }

  const handleCreateAccountPress = () => {
    navigation.navigate("signUp");
  };

  const handleLoginPress = () => {
    navigation.navigate("signIn");
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <AppButton
        onPress={handleCreateAccountPress}
        containerStyle={{ marginTop: 27 }}
        type="primary"
      >
        Create Account
      </AppButton>
      <AppButton
        onPress={handleLoginPress}
        containerStyle={{ marginTop: 29 }}
        type="outline"
      >
        Log In
      </AppButton>
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
});
