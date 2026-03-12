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
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import axiosClient from "../../api/axiosClient"; // <-- Import Axios gọi API

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      <View style={styles.formContainer}>
        <Text style={styles.appName}>ArtKids 🎨</Text>
        <Text style={styles.subtitle}>Cùng bé sáng tạo mỗi ngày</Text>

        <TextInput
          style={styles.input}
          placeholder="Email của phụ huynh"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFEAA7" },
  formContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 30 },
  appName: {
    fontSize: 40,
    fontWeight: "900",
    color: "#D63031",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#636E72",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FDCB6E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#00B894",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00B894",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  registerLink: { marginTop: 25, alignItems: "center" },
  registerText: { color: "#2D3436", fontSize: 15 },
  registerTextBold: { fontWeight: "bold", color: "#0984E3" },
});
