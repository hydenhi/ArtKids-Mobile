import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // NavigationContainer là bắt buộc phải có để bọc toàn bộ hệ thống điều hướng
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}