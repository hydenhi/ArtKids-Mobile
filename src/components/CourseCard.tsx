import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface CourseCardProps {
  title: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  isCombo?: boolean; // Để hiện badge "Combo" cho nổi bật
  onPress: () => void;
}

export default function CourseCard({ title, thumbnail, price, originalPrice, isCombo, onPress }: CourseCardProps) {
  // Hàm format tiền tệ VNĐ
  const formatPrice = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Ảnh bìa khóa học */}
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      
      {/* Badge Combo nếu có */}
      {isCombo && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 COMBO</Text>
        </View>
      )}

      {/* Thông tin */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 160, // Chiều rộng cố định để làm list lướt ngang
    marginRight: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F3542',
    height: 40, // Giữ chiều cao cố định cho 2 dòng
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B81',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#A4B0BE',
    textDecorationLine: 'line-through',
  },
});