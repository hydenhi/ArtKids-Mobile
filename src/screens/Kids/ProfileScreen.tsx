import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
// IMPORT useSafeAreaInsets THAY VÌ SafeAreaView
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useAuthStore((state) => state.logout);

  // Dùng hook này để lấy chiều cao chính xác của Status Bar
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get("/auth/me");
        const userData = response.data?.data?.user;
        setProfile(userData);
      } catch (error: any) {
        console.log("Lỗi tải Profile:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: () => logout() },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0984E3" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    // Thay SafeAreaView bằng View và cộng thêm insets.top vào paddingTop
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* THÔNG TIN NGƯỜI DÙNG */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              profile?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.infoBox}>
          <Text style={styles.fullname}>
            {profile?.fullname || profile?.name || "Phụ huynh ArtKids"}
          </Text>
          <Text style={styles.email}>
            {profile?.email || "Chưa cập nhật email"}
          </Text>
          <Text style={styles.username}>@{profile?.username || "user"}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert("Tính năng", "Sắp ra mắt!")}
        >
          <Ionicons name="pencil" size={20} color="#0984E3" />
        </TouchableOpacity>
      </View>

      {/* DANH SÁCH MENU CÀI ĐẶT */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            navigation.navigate("EditProfile", { currentProfile: profile })
          }
        >
          <View style={[styles.menuIconBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="person-outline" size={22} color="#1E88E5" />
          </View>
          <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIconBox, { backgroundColor: "#F3E5F5" }]}>
            <Ionicons name="lock-closed-outline" size={22} color="#8E24AA" />
          </View>
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIconBox, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#43A047"
            />
          </View>
          <Text style={styles.menuText}>Chính sách bảo mật</Text>
          <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
        </TouchableOpacity>
      </View>

      {/* NÚT ĐĂNG XUẤT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#D63031" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFBF7",
  },
  loadingText: { marginTop: 10, color: "#78909C", fontSize: 16 },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F5F5",
  },
  infoBox: { flex: 1, marginLeft: 15 },
  fullname: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  email: { fontSize: 14, color: "#636E72", marginBottom: 2 },
  username: { fontSize: 13, color: "#0984E3", fontWeight: "bold" },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F6FA",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: { flex: 1, fontSize: 16, color: "#2D3436", fontWeight: "500" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEAA7",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#FDCC6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    color: "#D63031",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
