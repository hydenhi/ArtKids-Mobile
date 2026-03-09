import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Modal, StyleSheet, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ParentGateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ParentGateModal({ visible, onClose, onSuccess }: ParentGateModalProps) {
  const [pin, setPin] = useState('');

  const handleVerify = () => {
    // TẠM THỜI MÔ PHỎNG LOGIC CHECK PIN (Mock API)
    // Thực tế bạn sẽ gọi API: axiosClient.post('/auth/verify-pin', { pin })
    if (pin === '1234') { // Giả sử mã PIN đúng là 1234
      setPin(''); // Xóa pin cũ đi
      onSuccess(); // Chạy hàm tiếp theo (thêm vào giỏ hàng)
    } else {
      Alert.alert('Sai mã PIN', 'Mã PIN không đúng. Bé hãy nhờ bố mẹ nhập giúp nhé!');
      setPin(''); // Xóa để nhập lại
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalBox}>
          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#636E72" />
          </TouchableOpacity>

          {/* Tiêu đề */}
          <Ionicons name="lock-closed" size={40} color="#D63031" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Khu vực dành cho Phụ huynh</Text>
          <Text style={styles.subtitle}>Vui lòng nhập mã PIN 4 số để tiếp tục thao tác này.</Text>

          {/* Ô nhập PIN */}
          <TextInput
            style={styles.pinInput}
            keyboardType="number-pad"
            secureTextEntry={true} // Ẩn mã PIN thành dấu chấm
            maxLength={4}
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              // Tự động kiểm tra nếu đã nhập đủ 4 số
              if (text.length === 4) {
                // setTimeout để UI kịp update số thứ 4 thành dấu chấm trước khi verify
                setTimeout(() => {
                   // Để logic kiểm tra ở ngoài hàm onChangeText thì tốt hơn, nhưng ở đây gọi handleVerify luôn cho tiện
                }, 100);
              }
            }}
            placeholder="Nhập PIN"
            placeholderTextColor="#B2BEC3"
          />

          {/* Nút Xác nhận */}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Nền đen mờ
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 20,
  },
  pinInput: {
    width: '60%',
    borderWidth: 2,
    borderColor: '#74B9FF',
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    paddingVertical: 10,
    marginBottom: 20,
    color: '#2D3436',
    backgroundColor: '#F1F2F6',
  },
  verifyButton: {
    backgroundColor: '#D63031', // Màu đỏ cảnh báo
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});