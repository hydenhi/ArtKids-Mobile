import React, { useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

export default function PaymentWebviewScreen({ route, navigation }: any) {
  // Nhận paymentUrl được truyền sang từ màn hình Giỏ hàng (CartScreen)
  const { paymentUrl } = route.params;
  const webviewRef = useRef<WebView>(null);

  // Hàm này chạy mỗi khi URL trong Webview thay đổi
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    console.log("Current URL: ", url);

    // KIỂM TRA ĐƯỜNG DẪN TRẢ VỀ TỪ VNPAY
    // Thực tế: Thay bằng domain backend của bạn (vd: your-api.com/vnpay-return)
    if (url.includes("vnpay-return") || url.includes("mock=123")) {
      // Giả lập check mã thành công (Thực tế VNPAY trả về vnp_ResponseCode=00 là thành công)
      const isSuccess =
        url.includes("vnp_ResponseCode=00") || url.includes("mock=123");

      if (isSuccess) {
        Alert.alert(
          "Thanh toán thành công!",
          "Khóa học đã được thêm vào Bàn học của bé.",
          [
            {
              text: "Tuyệt vời",
              onPress: () => {
                // Đóng Webview và quay về trang chủ hoặc trang Khóa học của tôi
                navigation.navigate("DrawerMain", { screen: "MyCourses" });
              },
            },
          ],
        );
      } else {
        Alert.alert("Thất bại", "Giao dịch đã bị hủy hoặc xảy ra lỗi.");
        navigation.goBack(); // Quay lại giỏ hàng
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Trình duyệt nhúng */}
      <WebView
        ref={webviewRef}
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
});
