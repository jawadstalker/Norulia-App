import React from 'react';

import { Stack } from 'expo-router';

/**
 * Tabs Layout
 *
 * IMPORTANT:
 *
 * BottomNavBar is intentionally NOT rendered here.
 *
 * The global BottomNavBar lives in:
 *
 * app/_layout.tsx
 *
 * Keeping the navigation bar in the root layout prevents
 * duplicate navigation bars when Expo Router renders:
 *
 * app/_layout.tsx
 *        +
 * app/(tabs)/_layout.tsx
 *
 * This layout is responsible only for the screens inside
 * the (tabs) route group.
 */

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,

        /**
         * Disable unnecessary screen transition animations.
         *
         * This keeps tab switching fast and prevents the
         * navigation stack from feeling heavy.
         */
        animation: 'none',

        /**
         * Keep gestures enabled for normal screen behavior.
         */
        gestureEnabled: true,
      }}
    />
  );
}