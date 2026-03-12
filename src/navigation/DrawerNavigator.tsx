import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";

// Import MainTab và Các màn hình phụ
import MainTabNavigator from "./MainTabNavigator";
import CourseDetailScreen from "../screens/Kids/CourseDetailScreen";
import ComboDetailScreen from "../screens/Kids/ComboDetailScreen";
import CartScreen from "../screens/Parent/CartScreen";
import PaymentWebviewScreen from "../screens/Parent/PaymentWebviewScreen";
import LearningScreen from "../screens/Kids/LearningScreen";
import EditProfileScreen from "../screens/Kids/EditProfileScreen";
import AllCoursesScreen from "../screens/Kids/AllCoursesScreen";
import AllCombosScreen from "../screens/Kids/AllCombosScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// 1. STACK CHỨA TOÀN BỘ MÀN HÌNH (Bao gồm cả Tab)
function LoggedInStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="ComboDetail" component={ComboDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="PaymentWebview" component={PaymentWebviewScreen} />
      <Stack.Screen name="Learning" component={LearningScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AllCourses" component={AllCoursesScreen} />
      <Stack.Screen name="AllCombos" component={AllCombosScreen} />
    </Stack.Navigator>
  );
}

// 2. GIAO DIỆN DRAWER TÙY CHỈNH
function CustomDrawerContent(props: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <Image
          source={{
            uri:
              user?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.fullname || "Bé ArtKids"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        {/* Điều hướng gọi vào AppStack -> Tabs -> HomeTab */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() =>
            props.navigation.navigate("AppStack", {
              screen: "Tabs",
              params: { screen: "HomeTab" },
            })
          }
        >
          <Ionicons name="home-outline" size={22} color="#546E7A" />
          <Text style={styles.drawerItemText}>Khám phá</Text>
        </TouchableOpacity>

        {/* Điều hướng gọi vào AppStack -> Tabs -> MyCoursesTab */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() =>
            props.navigation.navigate("AppStack", {
              screen: "Tabs",
              params: { screen: "MyCoursesTab" },
            })
          }
        >
          <Ionicons name="book-outline" size={22} color="#546E7A" />
          <Text style={styles.drawerItemText}>Bàn học của bé</Text>
        </TouchableOpacity>

        {/* Điều hướng gọi vào AppStack -> Cart */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() =>
            props.navigation.navigate("AppStack", { screen: "Cart" })
          }
        >
          <Ionicons name="cart-outline" size={22} color="#546E7A" />
          <Text style={styles.drawerItemText}>Giỏ hàng</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color="#D63031" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

// 3. XUẤT DRAWER CHÍNH
export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: "#FDFBF7", width: 280 },
      }}
    >
      {/* Bọc toàn bộ LoggedInStack vào trong Drawer với tên gọi là AppStack */}
      <Drawer.Screen name="AppStack" component={LoggedInStack} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: "#FFE082",
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: 12,
  },
  userName: { fontSize: 18, fontWeight: "900", color: "#37474F" },
  userEmail: { fontSize: 13, color: "#78909C", marginTop: 4 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#546E7A",
    marginLeft: 15,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  logoutText: {
    marginLeft: 10,
    color: "#D63031",
    fontSize: 16,
    fontWeight: "bold",
  },
});
