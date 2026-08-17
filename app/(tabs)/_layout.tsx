import React from 'react';
import {
  Stack,
} from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,

        /*
         * BottomNav already controls navigation.
         *
         * Avoid running a full screen transition animation
         * every time the user switches between main sections.
         */
        animation: 'none',

        /*
         * Prevent unnecessary gesture-driven transitions
         * on the main application sections.
         */
        gestureEnabled: false,

        /*
         * Keep inactive native screens detached where supported.
         */
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="protocol"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="assistant"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="schedule"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="medication"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}