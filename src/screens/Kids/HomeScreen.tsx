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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/useAuthStore";
import axiosClient from "../../api/axiosClient";

export default function HomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [courseRes, comboRes, categoryRes] = await Promise.all([
          axiosClient.get("/courses", { params: { status: "published" } }),
          axiosClient.get("/combos", { params: { status: "published" } }),
          axiosClient
            .get("/courses/categories/all")
            .catch(() => ({ data: { categories: [] } })),
        ]);
        const coursesData = courseRes.data?.courses || courseRes.data || [];
        const combosData = comboRes.data?.combos || comboRes.data || [];
        const catsData = categoryRes.data?.categories || [];

        setCourses(coursesData.slice(0, 6)); // Lấy top 6
        setCombos(combosData.slice(0, 6));
        setCategories(catsData);
      } catch (error: any) {
        console.log("Lỗi kết nối Backend: ", error.message);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };
    fetchHomeData();
  }, []);

  const SmallCourseCard = ({ item, isCombo = false }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        isCombo
          ? navigation.navigate("ComboDetail", {
              comboId: item._id,
              slug: item.slug,
            })
          : navigation.navigate("CourseDetail", {
              courseId: item._id,
              slug: item.slug,
            })
      }
    >
      <Image
        source={{
          uri:
            item.thumbnail ||
            (isCombo ? item.courses?.[0]?.thumbnail : null) ||
            "https://placehold.co/400x300/FFE082/D84315?text=ArtKids",
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
            <Text style={styles.ratingText}>{item.averageRating || "0"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CATEGORY_COLORS = [
    "#E8F5E9",
    "#FFF9C4",
    "#E0F7FA",
    "#F3E5F5",
    "#E1F5FE",
    "#FCE4EC",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* NÚT DRAWER ĐÃ BỊ XÓA Ở ĐÂY */}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá danh mục</Text>
          </View>
          <View style={styles.categoriesRow}>
            {loadingCategories ? (
              <ActivityIndicator
                size="small"
                color="#FF8A80"
                style={{ marginLeft: 20 }}
              />
            ) : categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
              >
                {categories.map((catName, index) => {
                  const bgColor =
                    CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryItem,
                        { backgroundColor: bgColor },
                      ]}
                      onPress={() =>
                        navigation.navigate("AllCourses", {
                          initialCategory: catName,
                        })
                      }
                    >
                      <Text style={styles.categoryText}>{catName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={{ marginLeft: 20, color: "#999" }}>
                Chưa có danh mục nào
              </Text>
            )}
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
                <TouchableOpacity
                  onPress={() => navigation.navigate("AllCourses")}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  onPress={() => navigation.navigate("AllCombos")}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
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
    right: -5,
    bottom: -5,
    width: 100,
    height: 100,
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
  },
  seeAllText: { fontSize: 14, color: "#90A4AE", fontWeight: "600" },
  categoriesRow: {
    paddingVertical: 10,
    marginTop: 5,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    marginBottom: 5, // Thêm khoảng trống cho bóng đổ
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF", // Fallback color
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#455A64",
    textAlign: "center",
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
