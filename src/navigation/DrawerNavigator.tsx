import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";

// Các màn hình chính – Drawer là navigator duy nhất cho phần logged-in
import HomeScreen from "../screens/Kids/HomeScreen";
import MyCoursesScreen from "../screens/Kids/MyCoursesScreen";
import WishlistScreen from "../screens/Kids/WishlistScreen";
import ProfileScreen from "../screens/Kids/ProfileScreen";

const Drawer = createDrawerNavigator();

// Nội dung tùy chỉnh của Drawer (phần trên avatar + danh sách mặc định + logout)
function CustomDrawerContent(props: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={{ flex: 1 }}>
      {/* Phần header: Avatar + tên người dùng */}
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

      {/* Danh sách mục điều hướng tự động từ Drawer.Screen */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Nút đăng xuất cố định bên dưới */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color="#D63031" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: "#FDFBF7", width: 280 },
        drawerActiveTintColor: "#FF6B6B",
        drawerInactiveTintColor: "#546E7A",
        drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
      }}
    >
      {/* Home: headerShown false vì HomeScreen tự vẽ header riêng */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "Khám phá",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Drawer cung cấp header chuẩn cho các màn hình còn lại */}
      <Drawer.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={{
          title: "Bàn học của bé",
          headerStyle: { backgroundColor: "#FDFBF7" },
          headerTintColor: "#00B894",
          headerTitleStyle: { fontWeight: "900", fontSize: 22 },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          title: "Yêu thích 💖",
          headerStyle: { backgroundColor: "#FDFBF7" },
          headerTintColor: "#D81B60",
          headerTitleStyle: { fontWeight: "900", fontSize: 20 },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Hồ sơ của tôi",
          headerStyle: { backgroundColor: "#FDFBF7" },
          headerTintColor: "#37474F",
          headerTitleStyle: { fontWeight: "900", fontSize: 22 },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
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
