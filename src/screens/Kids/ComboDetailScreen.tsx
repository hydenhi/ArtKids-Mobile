import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, DrawerActions } from "@react-navigation/native";
import axiosClient from "../../api/axiosClient";
import { useShopStore } from "../../store/useShopStore";
import { createPayment } from "../../api/paymentService";

// IMPORT CUSTOM TOAST
import CustomToast from "../../components/CustomToast";

export default function ComboDetailScreen({ route, navigation }: any) {
  const { comboId, slug } = route.params || {};

  const isMounted = useRef(true);
  const isFirstMount = useRef(true);

  const [combo, setCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [ownedCourseIds, setOwnedCourseIds] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // STATE ĐỂ QUẢN LÝ THÔNG BÁO (TOAST)
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as any,
  });

  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addToCart = useShopStore((state) => state.addToCart);

  const wishlist = useShopStore((state) => state.wishlist);
  const cart = useShopStore((state) => state.cart);

  const isLiked = combo
    ? wishlist.some((item: any) => item._id === combo._id)
    : false;
  const alreadyInCart = combo
    ? cart.some((item: any) => item._id === combo._id)
    : false;

  // HÀM HIỂN THỊ TOAST TỰ ẨN SAU 2 GIÂY
  const showToast = (
    message: string,
    type: "success" | "info" | "warning" = "success",
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  const fetchComboDetail = async () => {
    if (!comboId && !slug) return;

    try {
      setLoading(true);
      const fetchIdentifier = slug || comboId;

      const comboRes = await axiosClient.get(`/combos/${fetchIdentifier}`);
      const comboData =
        comboRes.data?.data || comboRes.data?.combo || comboRes.data;

      if (isMounted.current) {
        setCombo(comboData);
      }

      if (comboData?.courses && comboData.courses.length > 0) {
        const enrollmentChecks = await Promise.allSettled(
          comboData.courses.map((course: any) =>
            axiosClient
              .get(`/users/enroll/${course._id}/check`)
              .then((res) => ({
                courseId: course._id,
                isEnrolled:
                  res.data?.isEnrolled ||
                  res.data?.enrolled ||
                  res.data?.data?.isEnrolled ||
                  false,
              }))
              .catch(() => ({
                courseId: course._id,
                isEnrolled: false,
              })),
          ),
        );

        const owned = enrollmentChecks
          .filter(
            (result) =>
              result.status === "fulfilled" && result.value.isEnrolled,
          )
          .map((result: any) => result.value.courseId);

        if (isMounted.current) {
          setOwnedCourseIds(owned);

          const allCoursesOwned = comboData.courses.every((course: any) =>
            owned.includes(course._id),
          );
          setIsEnrolled(allCoursesOwned);
        }
      }
    } catch (error: any) {
      console.error("Fetch combo error:", error);
      if (isMounted.current) {
        showToast("Không thể tải chi tiết Combo!", "warning");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComboDetail();
    return () => {
      isMounted.current = false;
    };
  }, [comboId, slug]);

  useFocusEffect(
    React.useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      fetchComboDetail();
    }, [comboId, slug]),
  );

  const handleToggleWishlist = () => {
    if (!combo) return;
    toggleWishlist(combo);
    if (!isLiked)
      showToast("Đã thêm Combo vào danh sách Yêu thích!", "success");
    else showToast("Đã bỏ khỏi danh sách Yêu thích", "info");
  };

  const handleAddToCart = () => {
    if (!combo) return;

    if (isEnrolled) {
      showToast(
        "Bạn đã sở hữu tất cả khóa học trong Combo này rồi!",
        "warning",
      );
      return;
    }

    if (alreadyInCart) {
      showToast("Combo này đã có trong giỏ hàng rồi nhé!", "info");
      return;
    }

    addToCart({ ...combo, isCombo: true });
    showToast("Đã thêm Combo vào Giỏ hàng! 🛒", "success");
  };

  const handleBuyNow = async () => {
    if (!combo) return;

    if (isEnrolled) {
      showToast("Bạn đã sở hữu tất cả khóa học trong Combo này rồi!", "info");
      return;
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn muốn mua Combo "${combo.title}" với giá ${combo.price?.toLocaleString("vi-VN")} đ?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              if (!isMounted.current) return;
              setIsProcessingPayment(true);

              const paymentData = await createPayment({
                itemType: "combo",
                itemId: combo._id,
              });

              if (!isMounted.current) return;

              if (paymentData.success && paymentData.paymentUrl) {
                navigation.navigate("PaymentWebview", {
                  paymentUrl: paymentData.paymentUrl,
                  txnRef: paymentData.txnRef,
                  courseId: combo._id,
                  itemType: "combo",
                  isCombo: true,
                });
              } else {
                if (isMounted.current) {
                  showToast("Không thể tạo thanh toán!", "warning");
                }
              }
            } catch (error: any) {
              console.error("Payment error:", error);
              if (isMounted.current) {
                Alert.alert(
                  "Lỗi thanh toán",
                  error.response?.data?.message ||
                    "Không thể tạo thanh toán. Vui lòng thử lại!",
                );
              }
            } finally {
              if (isMounted.current) {
                setIsProcessingPayment(false);
              }
            }
          },
        },
      ],
    );
  };

  const renderCourses = () => {
    if (!combo?.courses || combo.courses.length === 0)
      return <Text style={styles.emptyText}>Combo chưa có khóa học nào.</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Các khóa học trong Combo</Text>
        {combo.courses.map((course: any, index: number) => {
          const isOwned = ownedCourseIds.includes(course._id);
          return (
            <TouchableOpacity
              key={course._id || index}
              style={styles.courseItem}
              onPress={() =>
                navigation.navigate("CourseDetail", {
                  courseId: course._id,
                  slug: course.slug,
                })
              }
            >
              <View style={styles.courseLeft}>
                <View
                  style={[
                    styles.iconBox,
                    isOwned && { backgroundColor: "#E8F5E9" },
                  ]}
                >
                  <Ionicons
                    name={isOwned ? "checkmark-circle" : "book"}
                    size={16}
                    color={isOwned ? "#4CD137" : "#00B894"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle}>
                    {course.title || `Khóa học ${index + 1}`}
                  </Text>
                  {isOwned && (
                    <Text style={styles.ownedLabel}>✓ Đã sở hữu</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A80" />
        <Text style={{ marginTop: 10, color: "#78909C" }}>
          Đang tải Combo...
        </Text>
      </View>
    );

  if (!combo)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: "#D63031", fontWeight: "bold" }}>
          Không tìm thấy Combo!
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#FF8A80",
            borderRadius: 10,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.headerImageContainer}>
          <Image
            source={{
              uri:
                combo.thumbnail ||
                "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400",
            }}
            style={styles.thumbnail}
          />
          <SafeAreaView style={styles.floatingHeader}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#37474F" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[styles.iconButton, { marginRight: 10 }]}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                <Ionicons name="menu" size={24} color="#37474F" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleWishlist}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color="#FF5252"
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.title}>{combo.title}</Text>
          <Text style={styles.description}>{combo.description}</Text>
          <View style={styles.statsRow}>
            {combo.oldPrice > 0 && (
              <Text style={styles.oldPrice}>
                {(combo.oldPrice || combo.originalPrice)?.toLocaleString(
                  "vi-VN",
                )}{" "}
                đ
              </Text>
            )}
            <Text style={styles.price}>
              {combo.price === 0
                ? "Miễn phí"
                : `${combo.price?.toLocaleString("vi-VN")} đ`}
            </Text>
          </View>
        </View>

        <View style={styles.contentArea}>{renderCourses()}</View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isEnrolled ? (
          <TouchableOpacity
            style={[styles.buyButton, styles.ownedButton]}
            onPress={() =>
              navigation.navigate("DrawerMain", { screen: "MyCourses" })
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buyButtonText}>Đã sở hữu</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.buyButton,
                isProcessingPayment && { opacity: 0.7 },
              ]}
              onPress={handleBuyNow}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buyButtonText}>Mua Combo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cartIconButton,
                alreadyInCart && {
                  backgroundColor: "#E8F5E9",
                  borderColor: "#4CD137",
                },
              ]}
              onPress={handleAddToCart}
            >
              <Ionicons
                name={alreadyInCart ? "cart" : "cart-outline"}
                size={28}
                color={alreadyInCart ? "#4CD137" : "#FF8A80"}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFBF7",
  },
  emptyText: {
    fontSize: 15,
    color: "#90A4AE",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  headerImageContainer: { position: "relative", width: "100%", height: 280 },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainInfo: { padding: 20, marginTop: -15 },
  title: { fontSize: 24, fontWeight: "900", color: "#37474F", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#78909C",
    lineHeight: 22,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  oldPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B2BEC3",
    textDecorationLine: "line-through",
  },
  price: { fontSize: 24, fontWeight: "900", color: "#FF8A80" },
  contentArea: { paddingHorizontal: 20, paddingBottom: 100 },
  tabContent: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 15,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  courseLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: "#E1F5FE",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseTitle: { fontSize: 16, fontWeight: "600", color: "#37474F", flex: 1 },
  ownedLabel: {
    fontSize: 12,
    color: "#4CD137",
    fontWeight: "bold",
    marginTop: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  cartIconButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FF8A80",
    backgroundColor: "#FFF",
    marginLeft: 15,
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#FF8A80",
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ownedButton: { backgroundColor: "#4CD137", marginRight: 0 },
  buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
});
