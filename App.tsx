import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/useAuthStore";
import { ActivityIndicator } from "react-native";

export default function App() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    loadStoredAuth(); // Load token ngay khi app start
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    // NavigationContainer là bắt buộc phải có để bọc toàn bộ hệ thống điều hướng
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
