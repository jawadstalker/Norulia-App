import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import SettingsScreen from './settings'; // یا مسیر درست

export default function SettingsRoute() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <SettingsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});