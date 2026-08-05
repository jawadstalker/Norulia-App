import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Brain, Clock, Trophy } from 'lucide-react-native';

const games = [
  {
    id: '1',
    title: 'Memory Challenge',
    description: 'Improve memory and cognitive skills',
    image: require('../../assets/games/game1.png'),
    level: 'Easy',
    time: '5 min',
  },
  {
    id: '2',
    title: 'Focus Training',
    description: 'Train attention and concentration',
    image: require('../../assets/games/game2.png'),
    level: 'Medium',
    time: '10 min',
  },
  {
    id: '3',
    title: 'Reaction Test',
    description: 'Improve reaction speed',
    image: require('../../assets/games/game3.png'),
    level: 'Hard',
    time: '7 min',
  },
];

export default function PsychoScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: colors.surface }]}
      >
        <ArrowLeft size={22} color={colors.text} />
        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Psycho-Physical Training
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Train your brain with interactive challenges
        </Text>

        {games.map((game, index) => (
          <Card key={game.id} style={styles.card}>
            <Image
              source={game.image}
              style={styles.cover}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={[styles.gameTitle, { color: colors.text }]}>
                {game.title}
              </Text>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {game.description}
              </Text>

              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <Brain size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {game.level}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {game.time}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.buttonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: Spacing.md,
    marginLeft: Spacing.lg,
  },
  backText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 170,
  },
  info: {
    padding: Spacing.md,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
  },
  button: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});