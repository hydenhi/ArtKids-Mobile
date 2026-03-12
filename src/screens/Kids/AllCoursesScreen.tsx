import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

export default function AllCoursesScreen({ navigation }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/courses?limit=1000");
        const data = res.data?.courses || res.data || [];
        setCourses(data);
      } catch (error: any) {
        console.log("❌ Lỗi lấy danh sách khóa học: ", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả Khóa học</Text>
        <View style={{ width: 40 }} />
      </View>

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
    flex: 1,
    margin: 10,
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
});
