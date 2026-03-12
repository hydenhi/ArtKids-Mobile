import React, { useState, useEffect } from "react";
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
import axiosClient from "../../api/axiosClient";
import { useShopStore } from "../../store/useShopStore";

export default function ComboDetailScreen({ route, navigation }: any) {
  const { comboId, slug } = route.params || {};

  const [combo, setCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Lưu ý: Tùy thuôc vào backend, giỏ hàng có hỗ trợ combo không
  // Ở đây giả sử giỏ hàng hỗ trợ các loại khóa học học combo chung
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const isInWishlist = useShopStore((state) => state.isInWishlist);
  const addToCart = useShopStore((state) => state.addToCart);
  const isInCart = useShopStore((state) => state.isInCart);

  const isLiked = combo ? isInWishlist(combo._id) : false;
  const alreadyInCart = combo ? isInCart(combo._id) : false;

  useEffect(() => {
    const fetchComboDetail = async () => {
      if (!comboId && !slug) return;

      try {
        setLoading(true);
        const fetchIdentifier = slug || comboId;

        const [comboRes, enrollCheckRes] = await Promise.all([
          axiosClient.get(`/combos/${fetchIdentifier}`),
          // Giả sử API check enroll cho combo là như check course, nếu chưa có thì bắt false
          axiosClient
            .get(`/users/enroll/${comboId || slug}/check`)
            .catch(() => ({ data: { isEnrolled: false } })),
        ]);

        const comboData =
          comboRes.data?.data || comboRes.data?.combo || comboRes.data;
        const enrolledStatus =
          enrollCheckRes.data?.isEnrolled ||
          enrollCheckRes.data?.enrolled ||
          enrollCheckRes.data?.data?.isEnrolled ||
          false;

        setCombo(comboData);
        setIsEnrolled(enrolledStatus);
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          "Không thể tải chi tiết Combo. Vui lòng thử lại sau!",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComboDetail();
  }, [comboId, slug]);

  const handleToggleWishlist = () => {
    if (!combo) return;
    // Tạm thời coi combo như course để dùng trong wishlist (cần store hỗ trợ)
    toggleWishlist(combo);
    if (!isLiked)
      Alert.alert("Yêu thích 💖", "Đã thêm Combo vào danh sách Yêu thích!");
  };

  const handleAddToCart = () => {
    if (!combo) return;

    if (isEnrolled) {
      Alert.alert(
        "Đã sở hữu",
        "Bạn đã mua Combo này rồi, hãy vào Bàn học để xem nhé!",
      );
      return;
    }

    if (alreadyInCart) {
      Alert.alert("Giỏ hàng", "Combo này đã có trong giỏ hàng rồi nhé!", [
        { text: "Đi đến Giỏ hàng", onPress: () => navigation.navigate("Cart") },
        { text: "Ở lại", style: "cancel" },
      ]);
      return;
    }

    addToCart({ ...combo, isCombo: true });
    Alert.alert(
      "Thành công! 🛒",
      "Đã thêm Combo vào Giỏ hàng của phụ huynh!",
      [
        { text: "Ở lại trang", style: "cancel" },
        { text: "Đi đến Giỏ hàng", onPress: () => navigation.navigate("Cart") },
      ],
    );
  };

  const renderCourses = () => {
    if (!combo?.courses || combo.courses.length === 0)
      return <Text style={styles.emptyText}>Combo chưa có khóa học nào.</Text>;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Các khóa học trong Combo</Text>
        {combo.courses.map((course: any, index: number) => (
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
              <View style={styles.iconBox}>
                <Ionicons name="book" size={16} color="#00B894" />
              </View>
              <Text style={styles.courseTitle}>
                {course.title || `Khóa học ${index + 1}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
          </TouchableOpacity>
        ))}
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
          </SafeAreaView>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.title}>{combo.title}</Text>
          <Text style={styles.description}>{combo.description}</Text>
          <View style={styles.statsRow}>
            {combo.oldPrice > 0 && (
              <Text style={styles.oldPrice}>
                {(combo.oldPrice || combo.originalPrice)?.toLocaleString("vi-VN")} đ
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
        <TouchableOpacity
          style={[
            styles.buyButton,
            isEnrolled && { backgroundColor: "#0984E3", marginRight: 0 },
          ]}
          onPress={
            isEnrolled
              ? () => navigation.navigate("DrawerMain", { screen: "MyCourses" })
              : handleAddToCart
          }
        >
          <Text style={styles.buyButtonText}>
            {isEnrolled ? "Vào học ngay 🚀" : "Mua Combo"}
          </Text>
        </TouchableOpacity>
        {!isEnrolled && (
          <TouchableOpacity
            style={[
              styles.cartIconButton,
              alreadyInCart && { backgroundColor: "#E8F5E9", borderColor: "#4CD137" },
            ]}
            onPress={handleAddToCart}
          >
            <Ionicons
              name={alreadyInCart ? "cart" : "cart-outline"}
              size={28}
              color={alreadyInCart ? "#4CD137" : "#FF8A80"}
            />
          </TouchableOpacity>
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
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseTitle: { fontSize: 16, fontWeight: "600", color: "#37474F", flex: 1 },
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
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
});
