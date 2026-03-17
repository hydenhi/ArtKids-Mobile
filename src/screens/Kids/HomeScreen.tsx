import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/useAuthStore";
import axiosClient from "../../api/axiosClient";

export default function HomeScreen({ navigation }: any) {
  useAuthStore((state) => state.user);

  const [courses, setCourses] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const testimonials = [
    {
      id: "1",
      text: "Con rất thích vẽ khủng long! Bài học dễ hiểu và mẹ bảo tranh của con tiến bộ rõ rệt.",
      author: "Bé Leo, 7 tuổi",
    },
    {
      id: "2",
      text: "Cô giáo giúp con hoàn thành bộ màu nước đầu tiên. Con rất tự hào về bức tranh của mình!",
      author: "Bé Mia, 8 tuổi",
    },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const [courseRes, comboRes] = await Promise.all([
          axiosClient.get("/courses", { params: { status: "published" } }),
          axiosClient.get("/combos", { params: { status: "published" } }),
        ]);

        const coursesData = courseRes.data?.courses || courseRes.data || [];
        const combosData = comboRes.data?.combos || comboRes.data || [];

        setCourses(coursesData.slice(0, 8));
        setCombos(combosData.slice(0, 6));
      } catch (error: any) {
        console.log("Lỗi kết nối Backend: ", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const featuredCourse = courses[0];
  const miniCourses = courses.slice(1, 3);
  const featuredCombo = combos[0];
  const miniCombos = combos.slice(1, 3);

  const getOldPrice = (item: any) =>
    Number(item?.oldPrice || item?.originalPrice || 0);

  const getPrice = (item: any) => Number(item?.price || 0);

  const getCourseDiscountPercent = (item: any) => {
    const oldPrice = getOldPrice(item);
    const price = getPrice(item);
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const getComboDiscountPercent = (item: any) =>
    Number(item?.discountPercentage || 0);

  const formatPrice = (value: number) =>
    value === 0 ? "Miễn phí" : `${value.toLocaleString("vi-VN")} đ`;

  const openCourse = (course: any) => {
    if (!course) return;
    navigation.navigate("CourseDetail", {
      courseId: course._id || course.id,
      slug: course.slug,
    });
  };

  const openCombo = (combo: any) => {
    if (!combo) return;
    navigation.navigate("ComboDetail", {
      comboId: combo._id || combo.id,
      slug: combo.slug,
    });
  };

  const renderMiniCard = (item: any, index: number) => (
    <TouchableOpacity
      key={item?._id || item?.id || `mini-${index}`}
      style={styles.miniCard}
      activeOpacity={0.9}
      onPress={() => openCourse(item)}
    >
      <View style={styles.miniCardImageWrap}>
        <Image
          source={{
            uri:
              item?.thumbnail ||
              "https://placehold.co/200x200/FEE9A8/F57F17?text=ArtKids",
          }}
          style={styles.miniCardImage}
        />

        <View style={styles.miniCardIconWrap}>
          <Ionicons
            name={index % 2 === 0 ? "color-palette" : "image"}
            size={20}
            color={index % 2 === 0 ? "#FFB300" : "#4DB6AC"}
          />
        </View>

        {getCourseDiscountPercent(item) > 0 && (
          <View style={styles.miniDiscountBadge}>
            <Text style={styles.miniDiscountText}>
              -{getCourseDiscountPercent(item)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.miniCardTitle} numberOfLines={1}>
        {item?.title || "Khóa học sáng tạo"}
      </Text>
      <Text style={styles.miniCardSubtitle}>Xưởng nghệ thuật</Text>
      <View style={styles.miniPriceRow}>
        <Text style={styles.miniPriceText}>{formatPrice(getPrice(item))}</Text>
        {getOldPrice(item) > getPrice(item) && (
          <Text style={styles.miniOldPriceText}>
            {formatPrice(getOldPrice(item))}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderComboMiniCard = (item: any, index: number) => (
    <TouchableOpacity
      key={item?._id || item?.id || `mini-combo-${index}`}
      style={styles.comboMiniCard}
      activeOpacity={0.9}
      onPress={() => openCombo(item)}
    >
      <View style={styles.comboMiniCardImageWrap}>
        <Image
          source={{
            uri:
              item?.thumbnail ||
              item?.courses?.[0]?.thumbnail ||
              "https://placehold.co/200x200/FFE0B2/EF6C00?text=Combo",
          }}
          style={styles.comboMiniCardImage}
        />

        <View style={styles.comboMiniCardIconWrap}>
          <Ionicons
            name={index % 2 === 0 ? "layers" : "gift"}
            size={20}
            color="#FB8C00"
          />
        </View>

        {getComboDiscountPercent(item) > 0 && (
          <View style={styles.comboMiniDiscountBadge}>
            <Text style={styles.comboMiniDiscountText}>
              -{getComboDiscountPercent(item)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.comboMiniCardTitle} numberOfLines={1}>
        {item?.title || "Combo sáng tạo"}
      </Text>
      <Text style={styles.comboMiniCardSubtitle}>
        Tiết kiệm hơn khi mua nhóm
      </Text>
      <View style={styles.miniPriceRow}>
        <Text style={styles.comboMiniPriceText}>
          {formatPrice(getPrice(item))}
        </Text>
        {getOldPrice(item) > getPrice(item) && (
          <Text style={styles.miniOldPriceText}>
            {formatPrice(getOldPrice(item))}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />

      <View style={styles.bgStrokeOne} />
      <View style={styles.bgStrokeTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <View style={styles.brandWrap}>
            <Text style={styles.brandText}>ArtKids</Text>
          </View>
          <TouchableOpacity
            style={styles.topCartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={22} color="#2F3A43" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Đánh thức chất{"\n"}
            <Text style={styles.heroTitleHighlight}>Nghệ Sĩ Nhí</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Mỗi bé đều là một nghệ sĩ. Bắt đầu hành trình sáng tạo với những bài
            học đầy hứng thú!
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate("AllCourses")}
          >
            <Text style={styles.heroButtonText}>Bắt đầu ngay</Text>
            <Ionicons name="rocket" size={15} color="#2F3A43" />
          </TouchableOpacity>

          <View style={styles.heroArtWrap}>
            <Image
              source={require("../../../assets/hero-img.jpg")}
              style={styles.heroArtImage}
            />
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Khóa học nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllCourses")}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFB300"
            style={{ marginTop: 30 }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.9}
              onPress={() => openCourse(featuredCourse)}
            >
              <View style={styles.featureBadge}>
                <Ionicons name="sparkles-outline" size={11} color="#7A6F52" />
                <Text style={styles.featureBadgeText}>4-10 tuổi</Text>
              </View>
              {getCourseDiscountPercent(featuredCourse) > 0 && (
                <View style={styles.featureDiscountBadge}>
                  <Text style={styles.featureDiscountText}>
                    -{getCourseDiscountPercent(featuredCourse)}%
                  </Text>
                </View>
              )}
              <Text style={styles.featureTitle} numberOfLines={1}>
                {featuredCourse?.title || "Màu nước diệu kỳ"}
              </Text>
              <Text style={styles.featureSubtitle}>
                Cùng bé khám phá sắc màu
              </Text>

              <View style={styles.featurePriceRow}>
                <Text style={styles.featurePriceText}>
                  {formatPrice(getPrice(featuredCourse))}
                </Text>
                {getOldPrice(featuredCourse) > getPrice(featuredCourse) && (
                  <Text style={styles.featureOldPriceText}>
                    {formatPrice(getOldPrice(featuredCourse))}
                  </Text>
                )}
              </View>

              <Image
                source={{
                  uri:
                    featuredCourse?.thumbnail ||
                    "https://placehold.co/180x180/B3E5FC/0277BD?text=Paint",
                }}
                style={styles.featureImage}
              />
            </TouchableOpacity>

            <View style={styles.miniCardRow}>
              {(miniCourses.length > 0 ? miniCourses : [{}, {}]).map(
                (item: any, index: number) => renderMiniCard(item, index),
              )}
            </View>
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Combo nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllCombos")}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.comboFeatureCard}
          activeOpacity={0.9}
          onPress={() => openCombo(featuredCombo)}
        >
          <View style={styles.featureBadge}>
            <Ionicons name="sparkles-outline" size={11} color="#7A6F52" />
            <Text style={styles.featureBadgeText}>Combo tiết kiệm</Text>
          </View>
          {getComboDiscountPercent(featuredCombo) > 0 && (
            <View style={styles.comboFeatureDiscountBadge}>
              <Text style={styles.comboFeatureDiscountText}>
                -{getComboDiscountPercent(featuredCombo)}%
              </Text>
            </View>
          )}

          <Text style={styles.comboFeatureTitle} numberOfLines={1}>
            {featuredCombo?.title || "Combo sáng tạo thông minh"}
          </Text>
          <Text style={styles.comboFeatureSubtitle}>
            Nhiều khóa học, giá ưu đãi hơn
          </Text>

          <View style={styles.featurePriceRow}>
            <Text style={styles.comboFeaturePriceText}>
              {formatPrice(getPrice(featuredCombo))}
            </Text>
            {getOldPrice(featuredCombo) > getPrice(featuredCombo) && (
              <Text style={styles.featureOldPriceText}>
                {formatPrice(getOldPrice(featuredCombo))}
              </Text>
            )}
          </View>

          <Image
            source={{
              uri:
                featuredCombo?.thumbnail ||
                featuredCombo?.courses?.[0]?.thumbnail ||
                "https://placehold.co/180x180/FFE0B2/EF6C00?text=Combo",
            }}
            style={styles.featureImage}
          />
        </TouchableOpacity>

        <View style={styles.comboMiniCardRow}>
          {(miniCombos.length > 0 ? miniCombos : [{}, {}]).map(
            (item: any, index: number) => renderComboMiniCard(item, index),
          )}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Bé nói gì về ArtKids...</Text>
        </View>

        {testimonials.map((item) => (
          <View key={item.id} style={styles.testimonialCard}>
            <View style={styles.quoteRow}>
              <Ionicons name="star" size={12} color="#FFCA28" />
              <Ionicons name="star" size={12} color="#FFCA28" />
              <Ionicons name="star" size={12} color="#FFCA28" />
              <Ionicons name="star" size={12} color="#FFCA28" />
              <Ionicons name="star" size={12} color="#FFCA28" />
            </View>

            <Text style={styles.testimonialText}>{item.text}</Text>

            <View style={styles.testimonialAuthorRow}>
              <Ionicons name="happy-outline" size={16} color="#2F3A43" />
              <Text style={styles.testimonialAuthor}>{item.author}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  bgStrokeOne: {
    position: "absolute",
    width: 220,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#FFE9A9",
    right: -70,
    top: 92,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.72,
  },
  bgStrokeTwo: {
    position: "absolute",
    width: 180,
    height: 78,
    borderRadius: 26,
    backgroundColor: "#B3E5FC",
    right: 16,
    top: 148,
    transform: [{ rotate: "14deg" }],
    opacity: 0.58,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topBar: {
    marginTop: 8,
    marginBottom: 20,
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandWrap: {
    paddingHorizontal: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F3A43",
  },
  topCartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6EAF0",
    shadowColor: "#D4DCE6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 3,
  },
  heroSection: {
    marginBottom: 20,
    position: "relative",
    minHeight: 185,
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 47,
    fontWeight: "900",
    color: "#21272D",
    letterSpacing: -0.7,
  },
  heroTitleHighlight: {
    color: "#F0A81B",
  },
  heroSubtitle: {
    marginTop: 10,
    width: "63%",
    fontSize: 12,
    lineHeight: 18,
    color: "#66727C",
    fontWeight: "500",
  },
  heroButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFB300",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#F49B00",
    shadowColor: "#F9A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
  },
  heroButtonText: {
    color: "#2F3A43",
    fontSize: 13,
    fontWeight: "800",
  },
  heroArtWrap: {
    position: "absolute",
    right: 8,
    top: 24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroArtImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  sectionHeaderRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 20,
    color: "#222D35",
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 11,
    color: "#5C9EBB",
    fontWeight: "700",
  },
  featureCard: {
    backgroundColor: "#DAF3FF",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#BDE6FA",
    shadowColor: "#9AD8F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  featureBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "#EDF9FF",
    borderWidth: 1,
    borderColor: "#C9EAF8",
    gap: 4,
  },
  featureBadgeText: {
    color: "#7A6F52",
    fontSize: 10,
    fontWeight: "700",
  },
  featureTitle: {
    marginTop: 10,
    fontSize: 23,
    color: "#23323E",
    fontWeight: "900",
    width: "62%",
  },
  featureSubtitle: {
    marginTop: 2,
    color: "#7F95A3",
    fontSize: 12,
    fontWeight: "500",
  },
  featureImage: {
    position: "absolute",
    right: 12,
    bottom: 10,
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 5,
    borderColor: "#E8F7FF",
  },
  featureDiscountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#EF5350",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  featureDiscountText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  featurePriceRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featurePriceText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
  },
  featureOldPriceText: {
    fontSize: 12,
    color: "#90A4AE",
    textDecorationLine: "line-through",
    fontWeight: "700",
  },
  miniCardRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ECEFF4",
    shadowColor: "#D8DEE8",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  miniCardIconWrap: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardImageWrap: {
    position: "relative",
    marginBottom: 8,
  },
  miniCardImage: {
    width: "100%",
    height: 94,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
  },
  miniCardTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#2A343D",
  },
  miniCardSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#8A98A4",
    fontWeight: "600",
  },
  miniDiscountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 3,
    backgroundColor: "#EF5350",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  miniDiscountText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  miniPriceRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniPriceText: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "800",
  },
  miniOldPriceText: {
    fontSize: 10,
    color: "#90A4AE",
    textDecorationLine: "line-through",
    fontWeight: "700",
  },
  comboFeatureCard: {
    backgroundColor: "#FFF1E6",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#FFD8BC",
    shadowColor: "#FFCCA8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  comboFeatureDiscountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FB8C00",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  comboFeatureDiscountText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  comboFeatureTitle: {
    marginTop: 10,
    fontSize: 23,
    color: "#6D3A00",
    fontWeight: "900",
    width: "62%",
  },
  comboFeatureSubtitle: {
    marginTop: 2,
    color: "#9A6B3D",
    fontSize: 12,
    fontWeight: "500",
  },
  comboFeaturePriceText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#E65100",
  },
  comboMiniCardRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  comboMiniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFE0B2",
    shadowColor: "#FFD3A1",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  comboMiniDiscountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 3,
    backgroundColor: "#FB8C00",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  comboMiniDiscountText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  comboMiniCardIconWrap: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  comboMiniCardImageWrap: {
    position: "relative",
    marginBottom: 8,
  },
  comboMiniCardImage: {
    width: "100%",
    height: 94,
    borderRadius: 16,
    backgroundColor: "#FFF8F0",
  },
  comboMiniCardTitle: {
    marginTop: 8,
    fontSize: 12,
    color: "#8D4E12",
    fontWeight: "800",
  },
  comboMiniCardSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#B07C47",
    fontWeight: "600",
  },
  comboMiniPriceText: {
    fontSize: 12,
    color: "#E65100",
    fontWeight: "800",
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E9EDF3",
    marginBottom: 12,
    shadowColor: "#DCE2EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 3,
  },
  quoteRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 10,
  },
  testimonialText: {
    color: "#66727C",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
  },
  testimonialAuthorRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  testimonialAuthor: {
    color: "#2F3A43",
    fontSize: 11,
    fontWeight: "800",
  },
});
