import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  visible: boolean;
}

export default function CustomToast({
  message,
  type = "success",
  visible,
}: CustomToastProps) {
  // Quản lý hiệu ứng trượt và độ mờ
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Khi hiện: Trượt xuống và rõ dần
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 60, // Khoảng cách trượt xuống từ cạnh trên
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Khi ẩn: Trượt ngược lên và mờ dần
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Chọn màu và icon tùy theo loại thông báo
  const getConfig = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle", color: "#00B894" }; // Xanh lá
      case "warning":
        return { icon: "warning", color: "#FDCB6E" }; // Vàng
      case "info":
        return { icon: "information-circle", color: "#0984E3" }; // Xanh dương
      default:
        return { icon: "checkmark-circle", color: "#00B894" };
    }
  };

  const { icon, color } = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity, borderLeftColor: color },
      ]}
    >
      <Ionicons name={icon as any} size={28} color={color} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderLeftWidth: 6,
    zIndex: 9999, // Đảm bảo luôn nổi lên trên cùng
  },
  message: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2D3436",
    marginLeft: 12,
    flex: 1,
  },
});
