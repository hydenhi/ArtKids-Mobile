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
import CustomHeader from "../../components/CustomHeader";
import { changePassword } from "../../api/userService";

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await changePassword({ currentPassword, newPassword });

      Alert.alert("Thành công", res?.message || "Đổi mật khẩu thành công.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Không thể đổi mật khẩu lúc này.";
      Alert.alert("Đổi mật khẩu thất bại", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Đổi mật khẩu" />

      <KeyboardAvoidingView
        style={styles.formWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor="#9AA5B1"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            editable={!isLoading}
          />

          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="#9AA5B1"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!isLoading}
          />

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#9AA5B1"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  formWrap: { flex: 1 },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#546E7A",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#2D3436",
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#0984E3",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
