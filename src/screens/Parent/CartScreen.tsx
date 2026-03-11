import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useShopStore } from "../../store/useShopStore";
import axiosClient from "../../api/axiosClient"; // <-- IMPORT AXIOS ĐỂ GỌI API

export default function CartScreen({ navigation }: any) {
  // Lấy giỏ hàng và các hàm từ kho chứa
  const cartItems = useShopStore((state) => state.cart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart); // <-- THÊM HÀM XÓA SẠCH GIỎ HÀNG

  const [coupon, setCoupon] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false); // State để hiển thị loading khi đang thanh toán

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const handleRemoveItem = (id: string) => {
    Alert.alert("Xóa khóa học", "Bạn có muốn bỏ khóa học này khỏi giỏ không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => removeFromCart(id) },
    ]);
  };

  const handleApplyCoupon = () => {
    if (!coupon) return;
    Alert.alert("Mã giảm giá", `Đã áp dụng mã ${coupon} thành công! 🎉`);
    setCoupon("");
  };

  // --- HÀM THANH TOÁN GỌI API THẬT ---
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Giỏ hàng trống", "Hãy chọn thêm khóa học cho bé nhé!");
      return;
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn xác nhận đăng ký ${cartItems.length} khóa học với tổng tiền $${totalAmount.toFixed(2)}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán ngay",
          onPress: async () => {
            try {
              setIsCheckingOut(true);
              console.log("⏳ Đang xử lý thanh toán và ghi danh khóa học...");

              await Promise.all(
                cartItems.map((item) =>
                  axiosClient.post(`/users/enroll/${item._id || item.id}`),
                ),
              );

              console.log("✅ Đăng ký khóa học thành công!");

              clearCart();

              Alert.alert(
                "Thanh toán thành công! 🎉",
                "Các khóa học đã được thêm vào Bàn học của bé. Bé có thể bắt đầu học ngay bây giờ!",
                [
                  {
                    text: "Tuyệt vời",
                    onPress: () => navigation.popToTop(),
                  },
                ],
              );
            } catch (error: any) {
              console.log("❌ Lỗi thanh toán: ", error.message);
              const errorMsg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Có lỗi xảy ra khi đăng ký khóa học.";
              Alert.alert("Thanh toán thất bại", errorMsg);
            } finally {
              setIsCheckingOut(false);
            }
          },
        },
      ],
    );
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri:
            item.thumbnail ||
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400",
        }}
        style={styles.itemImage}
      />

      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price === 0 ? "Miễn phí" : `$${item.price}`}
        </Text>
      </View>

      <View style={styles.actionBox}>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item._id || item.id)}
          style={styles.deleteButton}
          disabled={isCheckingOut}
        >
          <Ionicons name="trash" size={20} color="#FF8A80" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
              disabled={isCheckingOut}
            >
              <Ionicons name="chevron-back" size={24} color="#37474F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giỏ hàng</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="cart-outline" size={24} color="#37474F" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
              }}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>Giỏ hàng đang trống</Text>
          </View>
        }
        ListFooterComponent={
          cartItems.length > 0 ? (
            <View style={styles.footerSection}>
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Nhập mã giảm giá..."
                  placeholderTextColor="#B0BEC5"
                  value={coupon}
                  onChangeText={setCoupon}
                  editable={!isCheckingOut}
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyCoupon}
                  disabled={isCheckingOut}
                >
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng cộng</Text>
                  <Text style={styles.summaryValue}>
                    ${totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  isCheckingOut && { opacity: 0.7 },
                ]}
                onPress={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.checkoutText}>Thanh Toán Ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  headerArea: {
    backgroundColor: "#FFE082",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#37474F" },
  iconButton: { padding: 5 },
  listContainer: { padding: 20, paddingBottom: 40 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: "center" },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 8,
  },
  itemPrice: { fontSize: 18, fontWeight: "900", color: "#FF8A80" },
  actionBox: { paddingHorizontal: 10 },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCart: { alignItems: "center", marginTop: 50 },
  emptyIcon: { width: 120, height: 120, opacity: 0.8, marginBottom: 15 },
  emptyText: { fontSize: 16, color: "#90A4AE", fontWeight: "bold" },
  footerSection: { marginTop: 10 },
  couponRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  couponInput: {
    flex: 1,
    backgroundColor: "#FFF",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#37474F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  applyButton: {
    backgroundColor: "#81D4FA",
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#81D4FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  applyButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  summaryBox: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 25,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 18, fontWeight: "bold", color: "#546E7A" },
  summaryValue: { fontSize: 24, fontWeight: "900", color: "#37474F" },
  checkoutButton: {
    backgroundColor: "#FF8A80",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#FF8A80",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  checkoutText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
});
