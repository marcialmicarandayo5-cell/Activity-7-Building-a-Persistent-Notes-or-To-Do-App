
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Keyboard,
} from 'react-native';

import { saveNotes, loadNotes } from './StorageService';

export default function App() {

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved notes
  useEffect(() => {
    const getSavedNotes = async () => {
      try {
        const savedNotes = await loadNotes();
        setNotes(savedNotes || []);
      } catch (error) {
        Alert.alert('Error', 'Unable to load saved notes.');
      } finally {
        setLoading(false);
      }
    };

    getSavedNotes();
  }, []);

  // Add or Update Note
  const addOrUpdateNote = async () => {

    if (noteText.trim() === '') {
      Alert.alert('Empty Note', 'Please write something first.');
      return;
    }

    let updatedNotes;

    if (editingId !== null) {
      updatedNotes = notes.map((note) =>
        note.id === editingId
          ? { ...note, text: noteText.trim() }
          : note
      );
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: noteText.trim(),
        date: new Date().toLocaleDateString(),
      };

      updatedNotes = [newNote, ...notes];
    }

    try {
      await saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setNoteText('');
      setEditingId(null);
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Error', 'Unable to save your note.');
    }
  };

  // Edit Note
  const editNote = (note) => {
    setNoteText(note.text);
    setEditingId(note.id);
  };

  // Cancel Editing
  const cancelEdit = () => {
    setNoteText('');
    setEditingId(null);
    Keyboard.dismiss();
  };

  // Delete Note
  const deleteNote = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedNotes = notes.filter(
              (note) => note.id !== id
            );

            try {
              await saveNotes(updatedNotes);
              setNotes(updatedNotes);
            } catch (error) {
              Alert.alert('Error', 'Unable to delete note.');
            }
          },
        },
      ]
    );
  };

  // Display Notes
  const renderNote = ({ item, index }) => (

    <View style={styles.noteCard}>

      <View style={styles.noteHeader}>
        <Text style={styles.noteNumber}>
          NOTE {notes.length - index}
        </Text>

        <Text style={styles.noteDate}>
          {item.date || 'Saved note'}
        </Text>
      </View>

      <Text style={styles.noteText}>
        {item.text}
      </Text>

      <View style={styles.noteActions}>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editNote(item)}
        >
          <Text style={styles.editButtonText}>
            ✏️ Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(item.id)}
        >
          <Text style={styles.deleteButtonText}>
            🗑️ Delete
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading your notes...
        </Text>
      </View>
    );
  }

  return (

    <View style={styles.container}>

      <StatusBar
        backgroundColor="#2563EB"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          My Notes
        </Text>

        <Text style={styles.headerSubtitle}>
          Keep your thoughts organized.
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputCard}>

        <Text style={styles.inputTitle}>
          {editingId !== null ? 'Edit Your Note' : 'Write a New Note'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#94A3B8"
          value={noteText}
          onChangeText={setNoteText}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={addOrUpdateNote}
        >
          <Text style={styles.addButtonText}>
            {editingId !== null ? '✓ Update Note' : '+ Add Note'}
          </Text>
        </TouchableOpacity>

        {editingId !== null && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelEdit}
          >
            <Text style={styles.cancelButtonText}>
              Cancel Editing
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {/* Notes Section */}
      <View style={styles.listHeader}>
        <Text style={styles.subtitle}>
          My Saved Notes
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {notes.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>

            <Text style={styles.emptyTitle}>
              No Notes Yet
            </Text>

            <Text style={styles.emptyText}>
              Start writing your thoughts and save your first note!
            </Text>
          </View>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },

  loadingText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#2563EB',
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    marginTop: 6,
  },

  inputCard: {
    backgroundColor: '#FFFFFF',
    margin: 18,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 100,
    marginBottom: 14,
  },

  addButton: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  countBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },

  countText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 25,
    flexGrow: 1,
  },

  noteCard: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 14,
    marginBottom: 13,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  noteNumber: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: 'bold',
  },

  noteDate: {
    color: '#94A3B8',
    fontSize: 12,
  },

  noteText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 15,
  },

  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },

  editButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },

  editButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  deleteButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },

  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

});
