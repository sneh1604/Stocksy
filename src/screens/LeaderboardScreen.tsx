import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Card from '../components/common/Card';

interface LeaderboardUser {
  id: string;
  username: string;
  portfolioValue: number;
  rank: number;
}

const LeaderboardScreen = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // TODO: Fetch leaderboard data from your backend
    const mockData: LeaderboardUser[] = [
      { id: '1', username: 'trader1', portfolioValue: 150000, rank: 1 },
      { id: '2', username: 'trader2', portfolioValue: 145000, rank: 2 },
      { id: '3', username: 'trader3', portfolioValue: 140000, rank: 3 },
    ];
    setUsers(mockData);
  }, []);

  const renderItem = ({ item }: { item: LeaderboardUser }) => (
    <Card>
      <View style={styles.userRow}>
        <Text style={styles.rank}>#{item.rank}</Text>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.value}>${item.portfolioValue.toLocaleString()}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 50,
  },
  username: {
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeaderboardScreen;