import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { ChevronDown, Search, XCircle, Check } from 'lucide-react-native';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchable?: boolean; 
};

export const SelectPicker: React.FC<Props> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
  disabled = false,
  searchable,
}) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const isSearchable = searchable ?? options.length > 20;

  const filtered = isSearchable && query.trim()
    ? options.filter(o => o.label.toLowerCase().startsWith(query.toLowerCase()))
    : options;

  const selectedLabel = options.find(o => o.value === selectedValue)?.label;

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !selectedLabel && styles.placeholder]}>
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#999" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {isSearchable && (
              <View style={styles.searchContainer}>
                <Search size={18} color="#999" />
                <TextInput
                  ref={searchRef}
                  style={styles.searchInput}
                  placeholder="Buscar..."
                  placeholderTextColor="#999"
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  autoFocus
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <XCircle size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedValue && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Check size={18} color="#103a57" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    ...(({ outlineWidth: 0, outlineStyle: 'none' } as any)),
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  },
  trigger: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 50 },
  triggerDisabled: { 
    opacity: 0.5 
  },
  triggerText: { 
    fontSize: 15, 
    color: '#333', 
    flex: 1 
  },
  placeholder: { 
    color: '#999' 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end' 
  },
  sheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16, 
    maxHeight: '60%', 
    paddingVertical: 8 
  },
  option: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 14 
  },
  optionSelected: { 
    backgroundColor: '#f0f5f9' 
  },
  optionText: { 
    fontSize: 15, 
    color: '#333' 
  },
  optionTextSelected: { 
    color: '#103a57', 
    fontWeight: '600' },
});