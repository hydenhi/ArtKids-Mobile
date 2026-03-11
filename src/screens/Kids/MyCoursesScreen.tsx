import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

export default function MyCoursesScreen({ navigation }: any) {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      console.log("⏳ Đang lấy danh sách khóa học của bé...");

      const response = await axiosClient.get("/auth/me");

      // Lấy danh sách ID khóa học đã đăng ký
      const userData =
        response.data?.data?.user || response.data?.user || response.data;
      const enrolledList = userData?.enrolledCourses || [];

      if (enrolledList.length > 0) {
        console.log(
          `🔍 Tìm thấy ${enrolledList.length} ID khóa học. Đang tải chi tiết...`,
        );

        // Dùng Promise.all để gọi API lấy chi tiết của tất cả khóa học CÙNG MỘT LÚC
        const coursePromises = enrolledList.map(async (item: any) => {
          // Lấy ID khóa học (tùy Backend trả về object hay string)
          const courseId =
            typeof item.course === "string"
              ? item.course
              : item.course?._id || item;

          try {
            // Gọi API lấy thông tin chi tiết của khóa học đó
            const detailRes = await axiosClient.get(`/courses/${courseId}`);
            const courseData =
              detailRes.data?.course || detailRes.data?.data || detailRes.data;

            // Trả về khóa học kèm theo tiến độ học (progress)
            return {
              ...courseData,
              progress: item.progress || 0,
            };
          } catch (err) {
            console.log(`⚠️ Bỏ qua khóa học bị lỗi ID: ${courseId}`);
            return null;
          }
        });

        // Chờ tất cả API tải xong thông tin và lọc bỏ những cái bị lỗi
        const fullCourses = (await Promise.all(coursePromises)).filter(
          (c) => c !== null,
        );

        console.log(`✅ Đã tải xong thông tin ${fullCourses.length} khóa học!`);
        setMyCourses(fullCourses);
      } else {
        // Nếu mảng rỗng thì set mảng rỗng
        setMyCourses([]);
      }
    } catch (error: any) {
      console.log("❌ Lỗi tải Bàn học:", error.message);
    } finally {
      setLoading(false);
    }
  };
  // CỰC KỲ QUAN TRỌNG: Dùng 'focus' để mỗi lần bấm vào Tab Bàn Học nó đều gọi lại API để làm mới dữ liệu
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMyCourses();
    });

    return unsubscribe;
  }, [navigation]);

  const renderCourseItem = ({ item }: { item: any }) => {
    // Nếu Backend trả về chỉ ID (string) thay vì object khóa học thì ta xử lý phòng hờ,
    // nhưng thông thường backend sẽ populate (điền đầy đủ thông tin khóa học vào)
    const courseId = item._id || item.course?._id || item;
    const title = item.title || item.course?.title || "Khóa học nghệ thuật";
    const thumbnail =
      item.thumbnail ||
      item.course?.thumbnail ||
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        // Truyền thẳng courseId sang trang Chi tiết để bé vào học
        onPress={() =>
          navigation.navigate("CourseDetail", { courseId: courseId })
        }
      >
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />

        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "0%" }]} />
            </View>
            <Text style={styles.progressText}>0%</Text>
          </View>

          <TouchableOpacity
            style={styles.studyButton}
            onPress={() =>
              navigation.navigate("CourseDetail", { courseId: courseId })
            }
          >
            <Text style={styles.studyButtonText}>Tiếp tục học 🚀</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B894" />
          <Text style={{ marginTop: 10, color: "#78909C" }}>
            Đang dọn dẹp bàn học...
          </Text>
        </View>
      ) : (
        <FlatList
          data={myCourses}
          keyExtractor={(item, index) =>
            item._id || item.course?._id || index.toString()
          }
          renderItem={renderCourseItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
                }}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Bàn học đang trống</Text>
              <Text style={styles.emptySubText}>
                Bé hãy nhờ bố mẹ mua khóa học để bắt đầu nhé!
              </Text>

              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.exploreButtonText}>Đi khám phá ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  header: { padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#00B894" },
  headerSubtitle: {
    fontSize: 15,
    color: "#55E6C1",
    marginTop: 5,
    fontWeight: "600",
  },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#00B894",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  infoBox: { flex: 1, marginLeft: 15, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 8,
  },

  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00B894",
    borderRadius: 3,
  },
  progressText: { fontSize: 12, fontWeight: "bold", color: "#00B894" },

  studyButton: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  studyButtonText: { color: "#00B894", fontWeight: "bold", fontSize: 14 },

  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyIcon: { width: 120, height: 120, opacity: 0.8, marginBottom: 15 },
  emptyText: {
    fontSize: 20,
    color: "#37474F",
    fontWeight: "bold",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#90A4AE",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#FFCC80",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  exploreButtonText: { color: "#BF360C", fontWeight: "bold", fontSize: 16 },
});
