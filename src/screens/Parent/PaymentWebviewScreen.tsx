import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { getPaymentStatus } from "../../api/paymentService";
import { useShopStore } from "../../store/useShopStore";

export default function PaymentWebviewScreen({ route, navigation }: any) {
  const {
    paymentUrl = "",
    txnRef = "",
    courseId = "",
    itemId = "",
    itemIds = [],
    isFromCart = false,
    isBulkCheckout = false,
    itemCount = 0,
  } = route?.params || {};

  const webviewRef = useRef<WebView>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const alertShownRef = useRef(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart);

  console.log("📦 Payment URL:", paymentUrl);
  console.log("🎫 TxnRef:", txnRef);
  console.log("📚 Course ID:", courseId);
  console.log("📦 Item ID:", itemId);
  console.log("📦 Item IDs:", itemIds);
  console.log("🛒 From Cart:", isFromCart);
  console.log("🛒 Bulk Checkout:", isBulkCheckout);
  console.log("🛒 Item Count:", itemCount);

  const handlePaymentSuccess = async () => {
    if (hasProcessed || alertShownRef.current) {
      console.log("⚠️ Payment already processed, skipping...");
      return;
    }

    setHasProcessed(true);
    alertShownRef.current = true;
    setIsProcessingSuccess(true);

    try {
      if (txnRef) {
        const status = await getPaymentStatus(txnRef);
        console.log("✅ Payment verified:", status);
      }
    } catch (error) {
      console.error("❌ Verify payment error:", error);
    }

    // ✅ Xử lý xóa items khỏi cart
    if (isFromCart) {
      if (isBulkCheckout) {
        // Bulk checkout: clear toàn bộ cart
        clearCart();
        console.log("🗑️ Cleared entire cart after bulk checkout");
      } else if (itemId) {
        // Single item: chỉ xóa item đó
        removeFromCart(itemId);
        console.log("🗑️ Removed item from cart:", itemId);
      }
    }

    const successMessage = isBulkCheckout
      ? `Tất cả ${itemCount || "các"} khóa học đã được thêm vào Bàn học của bé.`
      : "Khóa học đã được thêm vào Bàn học của bé.";

    Alert.alert("Thanh toán thành công! 🎉", successMessage, [
      {
        text: "Tuyệt vời",
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url } = navState;
    console.log("🌐 Current URL:", url);

    if (hasProcessed || alertShownRef.current) return;

    const isReturnUrl =
      url.includes("vnpay-return") && !url.includes("localhost");

    if (isReturnUrl) {
      const urlObj = new URL(url);
      const responseCode =
        urlObj.searchParams.get("code") ||
        urlObj.searchParams.get("vnp_ResponseCode");

      console.log("📝 Response Code from vnpay-return:", responseCode);

      const isSuccess = responseCode === "00";

      if (isSuccess) {
        await handlePaymentSuccess();
      } else {
        if (!alertShownRef.current) {
          setHasProcessed(true);
          alertShownRef.current = true;
          Alert.alert(
            "Thanh toán thất bại",
            "Giao dịch đã bị hủy hoặc xảy ra lỗi. Vui lòng thử lại.",
            [{ text: "OK", onPress: () => navigation.goBack() }],
          );
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Hủy thanh toán?",
              "Bạn có chắc muốn hủy giao dịch này?",
              [
                { text: "Ở lại", style: "cancel" },
                { text: "Hủy", onPress: () => navigation.goBack() },
              ],
            );
          }}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán An toàn</Text>
        <View style={styles.headerSpacer} />
      </View>

      {paymentUrl ? (
        <>
          {!isProcessingSuccess && (
            <WebView
              ref={webviewRef}
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF8A80" />
                  <Text style={styles.loadingText}>
                    Đang tải cổng thanh toán...
                  </Text>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;

                if (hasProcessed || alertShownRef.current) {
                  console.log("⚠️ Already processed, ignoring error");
                  return;
                }

                if (
                  nativeEvent.description?.includes("ERR_CONNECTION_REFUSED")
                ) {
                  const url = nativeEvent.url || "";
                  console.log("🔍 Connection refused URL:", url);

                  if (
                    url.includes("payment-result") ||
                    url.includes("txnRef")
                  ) {
                    try {
                      const urlObj = new URL(url);
                      const code =
                        urlObj.searchParams.get("code") ||
                        urlObj.searchParams.get("valid");

                      console.log("📝 Response Code from error:", code);

                      if (code === "00" || code === "1") {
                        console.log(
                          "✅ Payment success detected from error URL",
                        );
                        handlePaymentSuccess();
                        return;
                      }
                    } catch (e) {
                      console.error("Failed to parse error URL:", e);
                    }
                  }
                }

                if (!hasProcessed && !alertShownRef.current) {
                  console.error("❌ Real WebView error:", nativeEvent);
                  setHasProcessed(true);
                  alertShownRef.current = true;

                  Alert.alert(
                    "Lỗi",
                    "Không thể tải trang thanh toán. Vui lòng thử lại.",
                    [{ text: "OK", onPress: () => navigation.goBack() }],
                  );
                }
              }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}

          {isProcessingSuccess && (
            <View style={styles.successOverlay}>
              <ActivityIndicator size="large" color="#FF8A80" />
              <Text style={styles.successText}>Đang xử lý thanh toán...</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
          <Text style={styles.errorText}>Không có URL thanh toán!</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#FFF",
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3436" },
  headerSpacer: { width: 28 },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: { marginTop: 12, fontSize: 15, color: "#78909C" },
  webview: { flex: 1 },
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFBF7",
  },
  successText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#37474F",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D63031",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#FF8A80",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
