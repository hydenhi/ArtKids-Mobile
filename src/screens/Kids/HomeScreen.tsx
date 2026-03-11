import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/useAuthStore";
import axiosClient from "../../api/axiosClient";

// Dữ liệu tĩnh cho danh mục
const STATIC_CATEGORIES = [
  { id: "1", title: "Drawing", icon: "pencil", color: "#E8F5E9" },
  { id: "2", title: "Paint", icon: "color-palette", color: "#FFF9C4" },
  { id: "3", title: "Sketching", icon: "brush", color: "#E0F7FA" },
];

export default function HomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  const [courses, setCourses] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GỌI API KHI MỞ MÀN HÌNH
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const [courseRes, comboRes] = await Promise.all([
          axiosClient.get("/courses"),
          axiosClient.get("/combos"),
        ]);

        // CẬP NHẬT LẠI CÁCH LẤY DỮ LIỆU CHUẨN VỚI BACKEND
        // Lấy từ biến .courses và .combos bên trong data
        const coursesData = courseRes.data?.courses || courseRes.data || [];
        const combosData = comboRes.data?.combos || comboRes.data || [];

        setCourses(coursesData);
        setCombos(combosData);
      } catch (error: any) {
        console.log("❌ Lỗi kết nối Backend: ", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Component Thẻ Khóa học nhỏ gọn
  const SmallCourseCard = ({ item, isCombo = false }: any) => (
    <TouchableOpacity
      style={styles.card}
      // TRUYỀN CẢ _id VÀ slug SANG TRANG CHI TIẾT
      onPress={() =>
        navigation.navigate("CourseDetail", {
          courseId: item._id || item.id,
          slug: item.slug,
        })
      }
    >
      <Image
        source={{
          uri:
            item.thumbnail ||
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400",
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>
            {item.price === 0
              ? "Miễn phí"
              : `${item.price?.toLocaleString("vi-VN")} đ`}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFA000" />
            <Text style={styles.ratingText}>{item.averageRating ?? "5.0"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuBtn}
          >
            <Ionicons name="menu" size={28} color="#546E7A" />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>
            Xin chào, {user?.fullname?.split(" ")[0] || "Bé"}!
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#FF8A80" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#90A4AE" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#90A4AE"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm khóa học nghệ thuật..."
            placeholderTextColor="#90A4AE"
          />
        </View>

        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>
            Chào mừng đến với{"\n"}Thế giới Nghệ thuật!
          </Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
            }}
            style={styles.bannerMascot}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khám phá danh mục</Text>
          <View style={styles.categoriesRow}>
            {STATIC_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, { backgroundColor: cat.color }]}
              >
                <Ionicons name={cat.icon as any} size={28} color="#546E7A" />
                <Text style={styles.categoryText}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF8A80"
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Khóa học mới</Text>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={courses}
                keyExtractor={(item) => item._id || Math.random().toString()}
                renderItem={({ item }) => <SmallCourseCard item={item} />}
                contentContainerStyle={{ paddingLeft: 20, paddingBottom: 10 }}
                ListEmptyComponent={
                  <Text style={{ marginLeft: 20, color: "#999" }}>
                    Chưa có khóa học nào
                  </Text>
                }
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Combo phổ biến</Text>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={combos}
                keyExtractor={(item) => item._id || Math.random().toString()}
                renderItem={({ item }) => (
                  <SmallCourseCard item={item} isCombo={true} />
                )}
                contentContainerStyle={{ paddingLeft: 20, paddingBottom: 20 }}
                ListEmptyComponent={
                  <Text style={{ marginLeft: 20, color: "#999" }}>
                    Chưa có combo nào
                  </Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  scrollContent: { paddingBottom: 80 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  menuBtn: { marginRight: 8, padding: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE082",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#455A64",
    marginLeft: 10,
  },

  headerIcons: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginLeft: 10,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: "#FF5252",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFF",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#455A64" },

  bannerContainer: {
    backgroundColor: "#E0F7FA",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#006064",
    lineHeight: 26,
    zIndex: 2,
  },
  bannerBtn: {
    backgroundColor: "#FFCC80",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 15,
    zIndex: 2,
  },
  bannerBtnText: { color: "#BF360C", fontWeight: "bold", fontSize: 12 },
  bannerMascot: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 120,
    height: 120,
    zIndex: 1,
    opacity: 0.9,
  },

  section: { marginTop: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37474F",
    marginLeft: 20,
  },
  seeAllText: { fontSize: 14, color: "#90A4AE", fontWeight: "600" },

  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  categoryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "bold",
    color: "#546E7A",
  },

  card: {
    backgroundColor: "#FFF",
    width: 150,
    borderRadius: 20,
    marginRight: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 110,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  cardInfo: { marginTop: 10 },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: "#37474F", height: 40 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  cardPrice: { fontSize: 15, fontWeight: "900", color: "#FF8A80" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFA000",
    marginLeft: 3,
  },
});
