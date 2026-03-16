import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
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
        <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
        <ActivityIndicator size="large" color="#0984E3" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      <View style={styles.bgStrokeOne} />
      <View style={styles.bgStrokeTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 28) },
        ]}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <Text style={styles.headerSubTitle}>
            Quản lý thông tin và cài đặt
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri:
                  profile?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.fullname}>
              {profile?.fullname || profile?.name || "Phụ huynh ArtKids"}
            </Text>
            <Text style={styles.email}>
              {profile?.email || "Chưa cập nhật email"}
            </Text>
            <View style={styles.usernameBadge}>
              <Ionicons name="at" size={13} color="#0F766E" />
              <Text style={styles.usernameText}>
                {profile?.username || "user"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditProfile", { currentProfile: profile })
            }
          >
            <Ionicons name="create-outline" size={18} color="#0F766E" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStatCard, { backgroundColor: "#FFF7E6" }]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("WishlistTab", { currentProfile: profile })
              }
            >
              <Ionicons name="heart" size={18} color="#F97316" />
              <Text style={styles.quickStatTitle}>Yêu thích</Text>
              <Text style={styles.quickStatValue}>Danh sách yêu thích</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.quickStatCard, { backgroundColor: "#E8F7FF" }]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Cart", { currentProfile: profile })
              }
            >
              <Ionicons name="cart" size={18} color="#0284C7" />
              <Text style={styles.quickStatTitle}>Mua sắm</Text>
              <Text style={styles.quickStatValue}>Giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuHeading}>Tài khoản & bảo mật</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate("EditProfile", { currentProfile: profile })
            }
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#DBEEFF" }]}>
              <Ionicons name="person-outline" size={21} color="#1976D2" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
              <Text style={styles.menuSubText}>Cập nhật tên, ảnh đại diện</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert("Tính năng", "Đổi mật khẩu sắp ra mắt!")}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#FFE6F3" }]}>
              <Ionicons name="lock-closed-outline" size={21} color="#DB2777" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
              <Text style={styles.menuSubText}>
                Tăng cường bảo vệ tài khoản
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            onPress={() =>
              Alert.alert("Thông tin", "Chính sách bảo mật sắp ra mắt!")
            }
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#E8F8EE" }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#22A06B"
              />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuText}>Chính sách bảo mật</Text>
              <Text style={styles.menuSubText}>Quyền riêng tư và dữ liệu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C7" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#B91C1C" />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F8" },
  bgStrokeOne: {
    position: "absolute",
    width: 220,
    height: 86,
    borderRadius: 28,
    backgroundColor: "#FFE9A9",
    right: -70,
    top: 86,
    transform: [{ rotate: "-14deg" }],
    opacity: 0.68,
  },
  bgStrokeTwo: {
    position: "absolute",
    width: 174,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#B3E5FC",
    right: 22,
    top: 145,
    transform: [{ rotate: "12deg" }],
    opacity: 0.58,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  screenHeader: {
    marginTop: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2F3A43",
  },
  headerSubTitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6F7E8D",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
  },
  loadingText: { marginTop: 10, color: "#78909C", fontSize: 16 },
  profileCard: {
    marginTop: 2,
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#CFD9E4",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 3,
    backgroundColor: "#FFF4CF",
    borderWidth: 1,
    borderColor: "#F7E2A5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EEF2F6",
  },
  infoBox: { flex: 1, marginLeft: 14 },
  fullname: {
    fontSize: 19,
    fontWeight: "900",
    color: "#2F3A43",
    marginBottom: 4,
  },
  email: { fontSize: 14, color: "#708090", marginBottom: 8 },
  usernameBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BCEAE2",
    backgroundColor: "#EBFFFA",
    gap: 4,
  },
  usernameText: { fontSize: 13, color: "#0F766E", fontWeight: "700" },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: "#E6F9F6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CDEFEA",
  },

  quickStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },
  quickStatTitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#607080",
    fontWeight: "600",
  },
  quickStatValue: {
    marginTop: 2,
    fontSize: 15,
    color: "#2F3A43",
    fontWeight: "800",
  },

  menuContainer: {
    backgroundColor: "#FFF",
    marginTop: 14,
    borderRadius: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    shadowColor: "#CFD9E4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },
  menuHeading: {
    fontSize: 14,
    color: "#8CA0B3",
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFF3F8",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    color: "#2F3A43",
    fontWeight: "700",
  },
  menuSubText: {
    marginTop: 2,
    fontSize: 12,
    color: "#8EA0B2",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2EE",
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFD5CC",
    shadowColor: "#F7C4B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
  },
});
