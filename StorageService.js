
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MY_NOTES';

// Save notes to device
export const saveNotes = async (notes) => {
  try {
    const jsonValue = JSON.stringify(notes);

    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);

  } catch (error) {
    console.log('Error saving notes:', error);
  }
};

// Load notes from device
export const loadNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);

    return jsonValue != null ? JSON.parse(jsonValue) : [];

  } catch (error) {
    console.log('Error loading notes:', error);
    return [];
  }
};

// Delete all saved notes
export const clearNotes = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);

  } catch (error) {
    console.log('Error deleting notes:', error);
  }
};
