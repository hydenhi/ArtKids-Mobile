import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

// Hàm trích xuất ID youtube từ URL HOẶC trả về nguyên ID nếu đã là ID
const getYouTubeId = (rawUrl: string) => {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  // Bắt link youtube thông thường
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  // Giả sử backend truyền thẳng Video ID
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return url;
  }
  return url; // Thử trả về nguyên gốc ném vào player xem sao nếu các điều kiện kia trượt
};

export default function LearningScreen({ route, navigation }: any) {
  const {
    courseTitle = "Khóa học nghệ thuật",
    sections = [],
    initialLesson = null,
  } = route.params || {};

  // Trải phẳng (flatten) tất cả các bài học từ các phần để dễ điều hướng (Prev/Next)
  const allLessons = sections.flatMap(
    (sec: any) => sec.lessonsId || sec.lessons || [],
  );

  const [currentLesson, setCurrentLesson] = useState<any>(
    initialLesson || allLessons[0] || null,
  );

  const [playing, setPlaying] = useState(false);

  // Tìm vị trí bài học hiện tại trong danh sách phẳng
  const currentIndex = currentLesson
    ? allLessons.findIndex((l: any) => l._id === currentLesson._id)
    : -1;

  const hasNext = currentIndex !== -1 && currentIndex < allLessons.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    } else {
      Alert.alert("Hoàn thành!", "Tuyệt vời, bạn đã xem hết khóa học này!");
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleSelectLesson = (lesson: any) => {
    // Tạm thời bỏ qua vụ "locked/completed" vì API hiện tại chưa hỗ trợ tiến độ học tập chi tiết của từng user.
    // Ai đã vào màn hình này coi như học được hết.
    setCurrentLesson(lesson);
  };

  const onStateChange = useCallback(
    (state: string) => {
      if (state === "ended") {
        setPlaying(false);
        // Bạn có thể tự động chuyển bài ở đây nếu muốn bằng cách gọi handleNext()
      }
    },
    [currentIndex, allLessons],
  );

  const youtubeId = currentLesson
    ? getYouTubeId(currentLesson.videoUrl || currentLesson.url)
    : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#37474F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle}
        </Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Player Area */}
        <View style={styles.videoContainer}>
          {youtubeId ? (
            <YoutubePlayer
              height={220}
              play={playing}
              videoId={youtubeId}
              onChangeState={onStateChange}
            />
          ) : (
            <View style={styles.mockVideoBox}>
              <Ionicons name="videocam-off" size={60} color="#FF8A80" />
              <Text style={styles.mockVideoText}>
                {currentLesson
                  ? `Chưa lấy được Video (Link: ${currentLesson.videoUrl || currentLesson.url || "Không có link"})`
                  : "Chưa chọn bài học"}
              </Text>
            </View>
          )}
        </View>

        {/* Thông tin bài học hiện tại */}
        {currentLesson && (
          <View style={styles.currentLessonInfo}>
            <Text style={styles.subTitle}>Đang chiếu:</Text>
            <Text style={styles.mainTitle}>{currentLesson.title}</Text>
            {currentLesson.description ? (
              <Text style={styles.descText}>{currentLesson.description}</Text>
            ) : null}
          </View>
        )}

        {/* Danh sách các bài học (Curriculum List) theo từng phần */}
        <View style={styles.lessonListContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Danh sách bài giảng</Text>
          </View>

          {sections.map((section: any, sIdx: number) => {
            const sectionLessons = section.lessonsId || section.lessons || [];
            if (sectionLessons.length === 0) return null;

            return (
              <View key={section._id || sIdx} style={styles.sectionBlock}>
                <Text style={styles.sectionTitleName}>{section.title}</Text>
                {sectionLessons.map((lesson: any) => {
                  const isCurrent = currentLesson?._id === lesson._id;
                  return (
                    <TouchableOpacity
                      key={lesson._id}
                      style={[
                        styles.lessonItem,
                        isCurrent && styles.lessonItemActive,
                      ]}
                      onPress={() => handleSelectLesson(lesson)}
                    >
                      <View style={styles.lessonLeft}>
                        {isCurrent ? (
                          <Ionicons
                            name="play-circle"
                            size={24}
                            color="#FF8A80"
                          />
                        ) : (
                          <View style={styles.circleOutline} />
                        )}

                        <Text
                          style={[
                            styles.lessonTitle,
                            isCurrent && styles.lessonTitleActive,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                      </View>
                      <Text style={styles.durationText}>
                        {lesson.duration || "0"}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Thanh điều hướng Bottom Bar (Previous / Next Lesson) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navButtonSecondary, !hasPrev && { opacity: 0.5 }]}
          onPress={handlePrev}
          disabled={!hasPrev}
        >
          <Text style={styles.navButtonTextSecondary}>{"<"} Bài trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButtonPrimary, !hasNext && { opacity: 0.5 }]}
          onPress={handleNext}
          disabled={!hasNext}
        >
          <Text style={styles.navButtonTextPrimary}>Bài tiếp {">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    // TRÁNH TRÀN LÊN TAI THỎ CHO CÁC MÁY ANDROID CHÂN THỰC HƠN
    marginTop: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37474F",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F6FA",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Video Area
  videoContainer: {
    marginTop: 15,
    backgroundColor: "#000",
  },
  mockVideoBox: {
    width: "100%",
    height: 220,
    backgroundColor: "#FFE082",
    justifyContent: "center",
    alignItems: "center",
  },
  mockVideoText: {
    marginTop: 10,
    color: "#D84315",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Lesson Info
  currentLessonInfo: { paddingHorizontal: 20, marginTop: 25 },
  subTitle: {
    fontSize: 14,
    color: "#FF8A80",
    fontWeight: "bold",
    marginBottom: 5,
  },
  mainTitle: { fontSize: 22, fontWeight: "900", color: "#37474F" },
  descText: { fontSize: 14, color: "#90A4AE", marginTop: 8, lineHeight: 22 },

  // Lesson List
  lessonListContainer: { paddingHorizontal: 20, marginTop: 25 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#37474F" },

  sectionBlock: {
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitleName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#90A4AE",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  lessonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  lessonItemActive: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#00B894",
  },

  lessonLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  circleOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CFD8DC",
    marginLeft: 2,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#546E7A",
    marginLeft: 15,
    flex: 1,
  },
  lessonTitleActive: { color: "#00B894", fontWeight: "bold" },
  durationText: { fontSize: 13, color: "#90A4AE", fontWeight: "bold" },

  // Bottom Navigation Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: "#E0F7FA",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 10,
  },
  navButtonTextSecondary: {
    color: "#00B894",
    fontSize: 16,
    fontWeight: "bold",
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: "#FF8A80",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 10,
  },
  navButtonTextPrimary: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
