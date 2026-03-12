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
import axiosClient from "../../api/axiosClient";
import CustomHeader from "../../components/CustomHeader"; // <-- IMPORT HEADER MỚI

export default function EditProfileScreen({ route, navigation }: any) {
  const { currentProfile } = route.params || {};

  const [fullname, setFullname] = useState(
    currentProfile?.fullname || currentProfile?.name || "",
  );
  const [phone, setPhone] = useState(currentProfile?.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullname.trim()) {
      Alert.alert("Lỗi", "Họ và tên không được để trống!");
      return;
    }

    try {
      setIsLoading(true);
      await axiosClient.patch("/users/profile", {
        fullname: fullname,
        phone: phone,
      });

      Alert.alert(
        "Thành công!",
        "Thông tin cá nhân của bạn đã được cập nhật.",
        [{ text: "Tuyệt vời", onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra, không thể cập nhật thông tin lúc này.";
      Alert.alert("Cập nhật thất bại", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* THÊM CUSTOM HEADER VÀO ĐÂY */}
      <CustomHeader title="Chỉnh sửa thông tin" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <View style={styles.readonlyBox}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <Text style={styles.readonlyText}>
              @{currentProfile?.username || "user"}
            </Text>
          </View>

          <View style={styles.readonlyBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.readonlyText}>
              {currentProfile?.email || "Chưa có email"}
            </Text>
          </View>

          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên..."
            placeholderTextColor="#999"
            value={fullname}
            onChangeText={setFullname}
            editable={!isLoading}
          />

          <Text style={styles.label}>Số điện thoại (Tuỳ chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại..."
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  formContainer: { paddingHorizontal: 20, marginTop: 10 },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#546E7A",
    marginBottom: 8,
    marginLeft: 5,
  },
  readonlyBox: {
    backgroundColor: "#F5F6FA",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  readonlyText: { fontSize: 16, color: "#90A4AE", fontWeight: "500" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#2D3436",
  },
  saveButton: {
    backgroundColor: "#0984E3",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
