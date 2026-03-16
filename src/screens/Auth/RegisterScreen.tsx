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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

export default function RegisterScreen({ navigation }: any) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Cập nhật kiểm tra nhập đầy đủ
    if (!fullname || !username || !email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Định dạng email không hợp lệ!");
      return;
    }

    // 3. Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setIsLoading(true);
      console.log("⏳ Đang gửi yêu cầu đăng ký...");

      const response = await axiosClient.post("/auth/register", {
        username: username,
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
      // Lấy chính xác error message mà Backend (authController) trả về
      const errorMsg =
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại kết nối.";
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
      <StatusBar barStyle="dark-content" backgroundColor="#F1F7FF" />

      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleMid} />
      <View style={styles.bgCircleBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.titleBadge}>
            <MaterialCommunityIcons name="palette" size={30} color="#FFFFFF" />
          </View>

          <Text style={styles.appName}>ArtKids</Text>
          <Text style={styles.titleSecondary}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Mở thế giới sáng tạo cho bé ngay hôm nay
          </Text>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color="#3A4C8D"
              />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor="#8996C2"
                value={fullname}
                onChangeText={setFullname}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="at" size={20} color="#3A4C8D" />
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập (Ví dụ: phuhuynh01)"
                placeholderTextColor="#8996C2"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#3A4C8D"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8996C2"
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
                color="#3A4C8D"
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#8996C2"
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
                  color="#3A4C8D"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color="#3A4C8D"
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#8996C2"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#3A4C8D"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={styles.registerButtonContent}>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.registerButtonText}>Đăng Ký Ngay</Text>
                </View>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F7FF" },
  bgCircleTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#B3E5FC",
    top: -96,
    right: -52,
    opacity: 0.72,
  },
  bgCircleMid: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFE082",
    top: 180,
    left: -55,
    opacity: 0.35,
  },
  bgCircleBottom: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#FFCCBC",
    bottom: -90,
    right: -20,
    opacity: 0.4,
  },
  floatingIcon: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  floatTopLeft: {
    top: 112,
    left: 20,
    transform: [{ rotate: "-8deg" }],
  },
  floatTopRight: {
    top: 100,
    right: 26,
    transform: [{ rotate: "9deg" }],
  },
  floatBottomLeft: {
    bottom: 130,
    left: 14,
    transform: [{ rotate: "-12deg" }],
  },
  scrollContent: { flexGrow: 1, paddingBottom: 34 },
  backButton: {
    marginTop: 54,
    marginLeft: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    marginTop: 10,
  },
  titleBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FF7043",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 7,
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1E3A8A",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  titleSecondary: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "800",
    color: "#FF7043",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5E6F9F",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#273665",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E0FA",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#22315C",
  },
  registerButton: {
    backgroundColor: "#42A5F5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#42A5F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 10,
    elevation: 7,
  },
  registerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  registerButtonText: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  loginLink: { marginTop: 16, alignItems: "center" },
  loginText: { color: "#4A5A8C", fontSize: 15 },
  loginTextBold: { fontWeight: "bold", color: "#FF7043" },
});
