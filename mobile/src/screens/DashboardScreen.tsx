import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { linksApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Link } from '../types';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links', search],
    queryFn: async () => {
      const { data } = await linksApi.getLinks({
        search: search || undefined,
      });
      return data;
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: (url: string) => linksApi.createLink(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setUrl('');
      Alert.alert('Success', 'Link saved!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save link');
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      linksApi.updateLink(id, { isRead: !isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => linksApi.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const handleAddLink = () => {
    if (url.trim()) {
      createLinkMutation.mutate(url);
    }
  };

  const handleDeleteLink = (id: string, title?: string) => {
    Alert.alert(
      'Delete Link',
      `Are you sure you want to delete "${title || 'this link'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLinkMutation.mutate(id) },
      ]
    );
  };

  const renderLink = ({ item }: { item: Link }) => (
    <View style={styles.linkCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Reader', { id: item.id })}
        style={styles.linkContent}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />
        )}
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={2}>
            {item.title || item.url}
          </Text>
          {item.description && (
            <Text style={styles.linkDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.linkActions}>
        <TouchableOpacity
          onPress={() => toggleReadMutation.mutate({ id: item.id, isRead: item.isRead })}
          style={[styles.actionButton, item.isRead ? styles.unreadButton : styles.readButton]}
        >
          <Text style={styles.actionButtonText}>
            {item.isRead ? 'Unread' : 'Read'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteLink(item.id, item.title)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Read It Later</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addLinkContainer}>
        <TextInput
          style={styles.urlInput}
          placeholder="Enter URL to save..."
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddLink}
          disabled={createLinkMutation.isPending}
        >
          <Text style={styles.addButtonText}>
            {createLinkMutation.isPending ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      ) : links.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No links saved yet</Text>
          <Text style={styles.emptySubtext}>Add your first link above!</Text>
        </View>
      ) : (
        <FlatList
          data={links}
          renderItem={renderLink}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
  },
  addLinkContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  linkCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  linkContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  linkImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: '#10b981',
  },
  unreadButton: {
    backgroundColor: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
