import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/useAuthStore";
import axiosClient from "../../api/axiosClient"; // <-- Import Axios gọi API

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hàm lưu thông tin từ store Zustand
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      setIsLoading(true);
      console.log("⏳ Đang gửi yêu cầu đăng nhập...");

      // GỌI API ĐĂNG NHẬP THẬT
      const response = await axiosClient.post("/auth/login", {
        email: email,
        password: password,
      });

      console.log("Dữ liệu đăng nhập nhận được:", response.data);

      // Thích ứng với cấu trúc JSON trả về từ Backend (thường bọc trong biến data, user, token, hoặc accessToken)
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;
      const user =
        response.data?.user || response.data?.data?.user || response.data?.data;

      if (token && user) {
        // Cấu hình axiosClient để các API sau này tự động gửi kèm Token
        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;

        // Lưu vào App Store (Zustand sẽ lo việc chuyển sang màn hình chính)
        await login(user, token);
      } else {
        Alert.alert("Lỗi dữ liệu", "Không lấy được Token từ Server.");
      }
    } catch (error: any) {
      console.log("Lỗi đăng nhập:", error.message);
      if (error.response) {
        console.log("Chi tiết:", error.response.data);
      }
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!";
      Alert.alert("Đăng nhập thất bại", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8E7" />

      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />
      <View style={styles.bgCircleBottom} />

      <View style={styles.formContainer}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="palette" size={30} color="#FFFFFF" />
        </View>

        <Text style={styles.appName}>ArtKids</Text>
        <Text style={styles.subtitle}>Cùng bé sáng tạo mỗi ngày</Text>

        <View style={styles.sparkleRow}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={18}
            color="#FF8A00"
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color="#FFD54F"
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={16}
            color="#FF5E78"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#4E5D94"
            />
            <TextInput
              style={styles.input}
              placeholder="Email của phụ huynh"
              placeholderTextColor="#8C92AC"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#4E5D94"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#8C92AC"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#4E5D94"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.loginButtonContent}>
                <MaterialCommunityIcons
                  name="rocket-launch-outline"
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
            disabled={isLoading}
          >
            <Text style={styles.registerText}>
              Chưa có tài khoản?{" "}
              <Text style={styles.registerTextBold}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7",
  },
  bgCircleLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#FFE082",
    top: -90,
    right: -55,
    opacity: 0.75,
  },
  bgCircleSmall: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FF80AB",
    top: 120,
    left: -45,
    opacity: 0.28,
  },
  bgCircleBottom: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#80DEEA",
    bottom: -95,
    left: 45,
    opacity: 0.35,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FF6F00",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#FF6F00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#283593",
    textAlign: "center",
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 16,
    color: "#5F6989",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  sparkleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: "#253057",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7DDF5",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#263157",
  },
  loginButton: {
    backgroundColor: "#00BFA5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#00BFA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
  registerLink: { marginTop: 18, alignItems: "center" },
  registerText: { color: "#425083", fontSize: 15 },
  registerTextBold: { fontWeight: "bold", color: "#EF5350" },
});
