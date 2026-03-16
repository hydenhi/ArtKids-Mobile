import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import các màn hình
import MyCoursesScreen from "../screens/Kids/MyCoursesScreen";
import WishlistScreen from "../screens/Kids/WishlistScreen";
import ProfileScreen from "../screens/Kids/ProfileScreen";
import HomeScreen from "../screens/Kids/HomeScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#B2BEC3",
        tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: "#FFF" },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "MyCoursesTab") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "WishlistTab") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Khám phá" }}
      />
      <Tab.Screen
        name="MyCoursesTab"
        component={MyCoursesScreen}
        options={{ title: "Bàn học" }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen}
        options={{ title: "Yêu thích" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Hồ sơ" }}
      />
    </Tab.Navigator>
  );
}
