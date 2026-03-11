import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomHeaderProps {
  title: string;
  color?: string; // Màu chủ đạo (chữ + icon)
  backgroundColor?: string; // Màu nền
  rightIcon?: keyof typeof Ionicons.glyphMap; // Icon bên phải (tùy chọn)
  onRightPress?: () => void;
}

export default function CustomHeader({
  title,
  color = "#00B894", // Mặc định là màu xanh của app bạn
  backgroundColor = "#FDFBF7",
  rightIcon,
  onRightPress,
}: CustomHeaderProps) {
  const navigation = useNavigation();
  // Hook này tự động lấy chiều cao của Status bar (thời gian, pin)
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.header, { backgroundColor, paddingTop: insets.top + 10 }]}
    >
      {/* Nút Back bên trái */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={color} />
      </TouchableOpacity>

      {/* Tiêu đề ở giữa */}
      <Text style={[styles.title, { color }]}>{title}</Text>

      {/* Icon bên phải (nếu có truyền vào, ví dụ: giỏ hàng) */}
      {rightIcon ? (
        <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={28} color={color} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} /> // View rỗng để cân bằng bố cục 3 phần
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  iconBtn: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 38, // Cân bằng với độ rộng của icon (size 28 + padding)
  },
});
