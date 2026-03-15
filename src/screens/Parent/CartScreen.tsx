import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useShopStore } from "../../store/useShopStore";
import { createPayment, checkoutCart } from "../../api/paymentService";
import CustomHeader from "../../components/CustomHeader";
import { syncCartToBackend } from "../../api/paymentService";

export default function CartScreen({ navigation }: any) {
  const cartItems = useShopStore((state) => state.cart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart);

  const [coupon, setCoupon] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const handleRemoveItem = (id: string) => {
    Alert.alert("Xóa khóa học", "Bạn có muốn bỏ khóa học này khỏi giỏ không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          // ✅ Just call removeFromCart, don't await
          removeFromCart(id);
        },
      },
    ]);
  };

  const handleApplyCoupon = () => {
    if (!coupon) return;
    Alert.alert("Mã giảm giá", `Đã áp dụng mã ${coupon} thành công! 🎉`);
    setCoupon("");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Giỏ hàng trống", "Hãy chọn thêm khóa học cho bé nhé!");
      return;
    }

    const itemText =
      cartItems.length === 1
        ? "1 khóa học/combo"
        : `${cartItems.length} khóa học/combo`;

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn xác nhận thanh toán ${itemText} với tổng tiền ${totalAmount.toLocaleString("vi-VN")} đ?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán ngay",
          onPress: () => proceedCheckout(),
        },
      ],
    );
  };

  const proceedCheckout = async () => {
    try {
      setIsCheckingOut(true);

      if (cartItems.length > 0) {
        console.log("📤 Syncing cart to backend before checkout...");
        try {
          await syncCartToBackend(cartItems);
        } catch (syncError: any) {
          console.error("❌ Cart sync failed:", syncError);
          Alert.alert(
            "Lỗi đồng bộ giỏ hàng",
            "Không thể đồng bộ giỏ hàng với server. Vui lòng thử lại!",
          );
          setIsCheckingOut(false);
          return;
        }
      }

      // ✅ Call checkout API
      const paymentData = await checkoutCart();

      if (!paymentData.success) {
        Alert.alert(
          "Lỗi",
          paymentData.message || "Không thể tạo thanh toán. Vui lòng thử lại!",
        );
        return;
      }

      // Handle free flow
      if (paymentData.flow === "free") {
        clearCart();
        Alert.alert(
          "Đăng ký thành công! 🎉",
          "Tất cả khóa học miễn phí đã được thêm vào Bàn học của bé.",
          [
            {
              text: "Tuyệt vời",
              onPress: () => {
                navigation.navigate("DrawerMain", { screen: "MyCourses" });
              },
            },
          ],
        );
        return;
      }

      // Handle vnpay flow
      if (paymentData.flow === "vnpay" && paymentData.paymentUrl) {
        const cartItemIds = cartItems.map((item) => item._id);

        navigation.navigate("PaymentWebview", {
          paymentUrl: paymentData.paymentUrl,
          txnRef: paymentData.txnRef,
          itemIds: cartItemIds,
          isFromCart: true,
          isBulkCheckout: true,
          itemCount: cartItems.length,
        });
        return;
      }

      Alert.alert("Lỗi", "Phản hồi thanh toán không hợp lệ.");
    } catch (error: any) {
      console.error("Checkout error:", error);
      console.error("Error response:", error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!";
      Alert.alert("Thanh toán thất bại", errorMsg);
    } finally {
      setIsCheckingOut(false);
    }
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
        {item.isCombo && <Text style={styles.comboLabel}>📦 Combo</Text>}
        <Text style={styles.itemPrice}>
          {item.price === 0
            ? "Miễn phí"
            : `${item.price.toLocaleString("vi-VN")} đ`}
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
      <CustomHeader title="Giỏ hàng" rightIcon="cart-outline" />

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
                    {totalAmount.toLocaleString("vi-VN")} đ
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
    marginBottom: 4,
  },
  comboLabel: {
    fontSize: 12,
    color: "#FF8A80",
    fontWeight: "bold",
    marginBottom: 4,
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
