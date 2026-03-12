import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/useAuthStore";

import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="DrawerMain" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}
