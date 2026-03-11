import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/useAuthStore";

// Import các màn hình
import DrawerNavigator from "./DrawerNavigator";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import CourseDetailScreen from "../screens/Kids/CourseDetailScreen";
import CartScreen from "../screens/Parent/CartScreen";
import PaymentWebviewScreen from "../screens/Parent/PaymentWebviewScreen";
import LearningScreen from "../screens/Kids/LearningScreen";
import EditProfileScreen from "../screens/Kids/EditProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    // Tắt toàn bộ header mặc định của thư viện bằng headerShown: false
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="DrawerMain" component={DrawerNavigator} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen
            name="PaymentWebview"
            component={PaymentWebviewScreen}
          />
          <Stack.Screen name="Learning" component={LearningScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
