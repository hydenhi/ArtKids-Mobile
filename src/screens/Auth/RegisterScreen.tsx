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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

export default function RegisterScreen({ navigation }: any) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState(""); // <-- THÊM STATE USERNAME
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Cập nhật kiểm tra nhập đầy đủ (Thêm username)
    if (!fullname || !username || !email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setIsLoading(true);
      console.log("⏳ Đang gửi yêu cầu đăng ký...");

      // 3. GỬI THÊM USERNAME XUỐNG BACKEND
      const response = await axiosClient.post("/auth/register", {
        username: username, // <-- DỮ LIỆU BỊ THIẾU Ở LẦN TRƯỚC NẰM Ở ĐÂY
        fullname: fullname,
        email: email,
        password: password,
        role: "customer",
      });

      console.log("Đăng ký thành công:", response.data);

      Alert.alert(
        "Đăng ký thành công!",
        "Tài khoản phụ huynh đã được tạo. Hãy đăng nhập để cho bé khám phá nhé!",
        [{ text: "Đăng nhập ngay", onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      console.log("Lỗi đăng ký:", error.message);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng ký thất bại. Email hoặc username có thể đã tồn tại.";
      Alert.alert("Đăng ký thất bại", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#D63031" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.appName}>Tạo Tài Khoản 🎨</Text>
          <Text style={styles.subtitle}>
            Bắt đầu hành trình sáng tạo cùng bé
          </Text>

          {/* Ô nhập Họ và Tên */}
          <TextInput
            style={styles.input}
            placeholder="Họ và tên phụ huynh"
            placeholderTextColor="#999"
            value={fullname}
            onChangeText={setFullname}
            editable={!isLoading}
          />

          {/* Ô nhập Tên đăng nhập (MỚI THÊM) */}
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập (Ví dụ: phuhuynh01)"
            placeholderTextColor="#999"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
          />

          {/* Ô nhập Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          {/* Ô nhập Mật khẩu */}
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          {/* Ô Xác nhận mật khẩu */}
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>Đăng Ký Ngay</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              Đã có tài khoản?{" "}
              <Text style={styles.loginTextBold}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFEAA7" },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    marginTop: 20,
  },
  appName: {
    fontSize: 36,
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
  registerButton: {
    backgroundColor: "#0984E3",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  loginLink: { marginTop: 25, alignItems: "center" },
  loginText: { color: "#2D3436", fontSize: 15 },
  loginTextBold: { fontWeight: "bold", color: "#D63031" },
});
