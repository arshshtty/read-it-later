import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { linksApi } from '../services/api';
import type { ReaderTheme } from '../types';

type ReaderScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reader'>;
  route: RouteProp<RootStackParamList, 'Reader'>;
};

export default function ReaderScreen({ navigation, route }: ReaderScreenProps) {
  const { id } = route.params;
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const { width } = useWindowDimensions();

  const { data: link, isLoading } = useQuery({
    queryKey: ['link', id],
    queryFn: async () => {
      const { data } = await linksApi.getLink(id);
      return data;
    },
  });

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0',
        };
      case 'sepia':
        return {
          backgroundColor: '#f4ecd8',
          color: '#5f4b32',
        };
      default:
        return {
          backgroundColor: '#ffffff',
          color: '#000000',
        };
    }
  };

  const themeStyles = getThemeStyles();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!link) {
    return (
      <View style={styles.centered}>
        <Text>Link not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'light' && styles.activeTheme]}
            onPress={() => setTheme('light')}
          >
            <Text style={styles.themeButtonText}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'dark' && styles.activeTheme]}
            onPress={() => setTheme('dark')}
          >
            <Text style={styles.themeButtonText}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'sepia' && styles.activeTheme]}
            onPress={() => setTheme('sepia')}
          >
            <Text style={styles.themeButtonText}>Sepia</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: themeStyles.color }]}>
          {link.title}
        </Text>

        <TouchableOpacity onPress={() => Linking.openURL(link.url)}>
          <Text style={styles.url}>{link.url}</Text>
        </TouchableOpacity>

        {link.content ? (
          <RenderHTML
            contentWidth={width}
            source={{ html: link.content }}
            baseStyle={{
              color: themeStyles.color,
              fontSize: 18,
              lineHeight: 28,
            }}
          />
        ) : (
          <View style={styles.noContent}>
            <Text style={[styles.noContentText, { color: themeStyles.color }]}>
              Article content could not be extracted.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(link.url)}>
              <Text style={styles.viewOriginal}>View original article →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  activeTheme: {
    backgroundColor: '#4f46e5',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  url: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noContentText: {
    fontSize: 16,
    marginBottom: 16,
  },
  viewOriginal: {
    color: '#4f46e5',
    fontSize: 16,
  },
});
