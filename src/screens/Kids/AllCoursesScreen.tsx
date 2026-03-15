import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

const CATEGORY_ICONS: any = {
  Drawing: { icon: "pencil" },
  Vẽ: { icon: "pencil" },
  Paint: { icon: "color-palette" },
  "Hội họa": { icon: "color-palette" },
  Sketching: { icon: "brush" },
  "Phác thảo": { icon: "brush" },
  Craft: { icon: "cut" },
  "Thủ công": { icon: "cut" },
  Digital: { icon: "laptop" },
  "Kỹ thuật số": { icon: "laptop" },
  Clay: { icon: "construct" },
  "Đất sét": { icon: "construct" },
  Default: { icon: "apps" },
};

const getCategoryIcon = (name: string) => {
  if (!name || name === "all") return "grid-outline";
  const lowerName = name.toLowerCase();
  for (const key in CATEGORY_ICONS) {
    if (lowerName.includes(key.toLowerCase())) {
      return CATEGORY_ICONS[key].icon;
    }
  }
  return "apps-outline";
};

const STATIC_LEVELS = [
  { id: "all", title: "Tất cả", icon: "layers-outline" },
  { id: "beginner", title: "Cơ bản", icon: "star-outline" },
  { id: "intermediate", title: "Trung cấp", icon: "rocket-outline" },
  { id: "advanced", title: "Nâng cao", icon: "trophy-outline" },
];

export default function AllCoursesScreen({ route, navigation }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { initialCategory = "all" } = route.params || {};

  // Search and filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [level, setLevel] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axiosClient.get("/courses/categories/all");
      const data = res.data?.categories || [];

      const mappedCategories = data.map((cat: string) => ({
        id: cat,
        title: cat,
      }));

      setCategories([
        { id: "all", title: "Tất cả danh mục" },
        ...mappedCategories,
      ]);
    } catch (error: any) {
      console.log("Lỗi lấy danh mục: ", error.message);
      setCategories([{ id: "all", title: "Tất cả danh mục" }]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        level: level !== "all" ? level : undefined,
        status: "published", // Chỉ lấy khóa học đã xuất bản
        limit: 1000,
      };
      const res = await axiosClient.get("/courses", { params });
      const data = res.data?.courses || res.data || [];
      setCourses(data);
    } catch (error: any) {
      console.log("Lỗi lấy danh sách khóa học: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, level]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
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
            <Text style={styles.ratingText}>{item.averageRating ?? "5.0"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả Khóa học</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#90A4AE"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm khóa học..."
          placeholderTextColor="#90A4AE"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Danh mục</Text>
          {loadingCategories ? (
            <ActivityIndicator size="small" color="#FF8A80" />
          ) : (
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {categories.find((cat) => cat.id === category)?.title ||
                  "Tất cả danh mục"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#90A4AE" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Cấp độ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATIC_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.id}
                style={[
                  styles.filterButton,
                  level === lvl.id && styles.filterButtonActive,
                  { flexDirection: "row", alignItems: "center" }
                ]}
                onPress={() => setLevel(lvl.id)}
              >
                <Ionicons
                  name={lvl.icon as any}
                  size={16}
                  color={level === lvl.id ? "#FFF" : "#455A64"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    level === lvl.id && styles.filterButtonTextActive,
                  ]}
                >
                  {lvl.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Chọn danh mục</Text>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={24} color="#37474F" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.dropdownItem,
                    category === cat.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons 
                      name={getCategoryIcon(cat.title)} 
                      size={20} 
                      color={category === cat.id ? "#FF8A80" : "#90A4AE"} 
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={[
                        styles.dropdownItemText,
                        category === cat.id && styles.dropdownItemTextActive,
                      ]}
                    >
                      {cat.title}
                    </Text>
                  </View>
                  {category === cat.id && (
                    <Ionicons name="checkmark" size={20} color="#FF8A80" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8A80" />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có khóa học nào</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#37474F" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 10, paddingBottom: 20 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#90A4AE" },

  card: {
    backgroundColor: "#FFF",
    flex: 0.5,
    maxWidth: "48%",
    margin: 8,
    borderRadius: 20,
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
  cardPrice: { fontSize: 13, fontWeight: "900", color: "#FF8A80" },
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
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#455A64" },
  filterContainer: { paddingHorizontal: 20, marginBottom: 15 },
  filterGroup: { marginBottom: 15 },
  filterLabel: { fontSize: 16, fontWeight: "bold", color: "#37474F" },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 10,
  },
  filterButtonActive: { backgroundColor: "#FF8A80" },
  filterButtonText: { fontSize: 14, color: "#455A64" },
  filterButtonTextActive: { color: "#FFF" },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#455A64",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "85%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37474F",
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dropdownItemActive: {
    backgroundColor: "#FFF5F5",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#455A64",
  },
  dropdownItemTextActive: {
    color: "#FF8A80",
    fontWeight: "600",
  },
});
