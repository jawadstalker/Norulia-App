import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
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