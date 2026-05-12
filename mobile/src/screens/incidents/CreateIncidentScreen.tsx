import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, IncidentType, RentedItemResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createIncident, getRentedItems } from '../../services/incidentService';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';
import { Helmet } from 'react-helmet-async'; 

type CreateIncidentNav = NativeStackNavigationProp<RootStackParamList, 'CreateIncident'>;

type FieldErrors = {
  title?: string;
  description?: string;
  type?: string;
  relatedItem?: string;
  general?: string;
};

const INCIDENT_TYPES: { value: IncidentType; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  {
    value: 'GENERAL',
    label: 'General',
    icon: 'information-circle',
    description: 'Incidencia general sobre el servicio',
  },
  {
    value: 'DAMAGED_ITEM',
    label: 'Objeto dañado',
    icon: 'hammer',
    description: 'El objeto alquilado está dañado',
  },
];

const CreateIncidentScreen: React.FC = () => {
  const navigation = useNavigation<CreateIncidentNav>();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IncidentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [rentedItems, setRentedItems] = useState<RentedItemResponse[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<RentedItemResponse | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const damagedItemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(damagedItemAnim, {
      toValue: type === 'DAMAGED_ITEM' ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [type]);

  useEffect(() => {
    loadRentedItems();
  }, []);

  const loadRentedItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    try {
      const data = await getRentedItems(user.id, user.token);
      setRentedItems(data);
    } catch {
    } finally {
      setLoadingItems(false);
    }
  };

  const filteredItems = rentedItems.filter((item) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      item.itemTitle.toLowerCase().includes(query) ||
      item.ownerName.toLowerCase().includes(query) ||
      item.kitName.toLowerCase().includes(query)
    );
  });

  const clearErrors = () => setErrors({});

  const validate = (): boolean => {
    const localErrors: FieldErrors = {};

    if (!title.trim()) localErrors.title = 'El título es obligatorio.';
    if (!description.trim()) localErrors.description = 'La descripción es obligatoria.';
    if (!type) localErrors.type = 'Selecciona un tipo de incidencia.';
    if (type === 'DAMAGED_ITEM' && !selectedItem) {
      localErrors.relatedItem = 'Debes seleccionar el objeto dañado.';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    clearErrors();

    if (!validate()) return;
    if (!user || !type) return;

    setLoading(true);

    try {
      await createIncident(
        {
          title: title.trim(),
          description: description.trim(),
          type,
          user: { id: user.id },
          relatedItem: selectedItem ? { id: selectedItem.itemId } : null,
        },
        user.token,
      );
      navigation.navigate('MyIncidents');
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Error al crear la incidencia',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: RentedItemResponse) => {
    setSelectedItem(item);
    setSearchText(item.itemTitle);
    setDropdownOpen(false);
  };

  const handleClearItem = () => {
    setSelectedItem(null);
    setSearchText('');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const renderDropdownItem = ({ item }: { item: RentedItemResponse }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelectItem(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItemHeader}>
        <Ionicons name="cube" size={18} color={Colors.primary} />
        <Text style={styles.dropdownItemTitle} numberOfLines={1}>
          {item.itemTitle}
        </Text>
      </View>
      <View style={styles.dropdownItemDetails}>
        <View style={styles.dropdownDetailRow}>
          <Ionicons name="person" size={12} color={Colors.textSecondary} />
          <Text style={styles.dropdownDetailText}>
            Propietario: {item.ownerName}
          </Text>
        </View>
        <View style={styles.dropdownDetailRow}>
          <Ionicons name="calendar" size={12} color={Colors.textSecondary} />
          <Text style={styles.dropdownDetailText}>
            {formatDate(item.startDate)} — {formatDate(item.endDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Nueva Incidencia | KeaKit</title>
        <meta name="description" content="Crea una incidencia en KeaKit para reportar problemas con tus artículos, alquileres o servicios y recibe asistencia rápidamente."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>        
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Nueva Incidencia</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={commonStyles.screenPadding}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={[commonStyles.input, errors.title && commonStyles.inputError]}
              placeholder="Resumen breve de la incidencia"
              placeholderTextColor={Colors.textLight}
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                clearErrors();
              }}
              maxLength={100}
            />
            {errors.title && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{errors.title}</Text>
              </View>
            )}
          </View>

          {/* Selección de tipo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de incidencia *</Text>
            <View style={styles.typeContainer}>
              {INCIDENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeOption,
                    type === t.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => {
                    setType(t.value);
                    setSelectedItem(null);
                    setSearchText('');
                    setDropdownOpen(false);
                    clearErrors();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.typeIconRow}>
                    <Ionicons
                      name={t.icon}
                      size={24}
                      color={type === t.value ? Colors.textWhite : Colors.primary}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        type === t.value && styles.typeLabelSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.typeDescription,
                      type === t.value && styles.typeDescriptionSelected,
                    ]}
                  >
                    {t.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{errors.type}</Text>
              </View>
            )}
          </View>

          {type === 'DAMAGED_ITEM' && (
            <Animated.View
              style={[
                styles.animatedSection,
                {
                  opacity: damagedItemAnim,
                  transform: [{
                    translateY: damagedItemAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Objeto dañado *</Text>

                {selectedItem ? (
                  <View style={styles.selectedItemCard}>
                    <View style={styles.selectedItemInfo}>
                      <View style={styles.selectedItemHeader}>
                        <Ionicons name="cube" size={18} color={Colors.primary} />
                        <Text style={styles.selectedItemTitle} numberOfLines={1}>
                          {selectedItem.itemTitle}
                        </Text>
                      </View>
                      <Text style={styles.selectedItemDetail}>
                        Propietario: {selectedItem.ownerName}
                      </Text>
                      <Text style={styles.selectedItemDetail}>
                        {formatDate(selectedItem.startDate)} — {formatDate(selectedItem.endDate)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.clearItemButton}
                      onPress={handleClearItem}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View style={styles.searchInputContainer}>
                      <Ionicons name="search" size={18} color={Colors.textLight} style={styles.searchIcon} />
                      <TextInput
                        style={[
                          commonStyles.input,
                          styles.searchInput,
                          errors.relatedItem && commonStyles.inputError,
                        ]}
                        placeholder="Buscar objeto alquilado..."
                        placeholderTextColor={Colors.textLight}
                        value={searchText}
                        onChangeText={(v) => {
                          setSearchText(v);
                          setDropdownOpen(true);
                          clearErrors();
                        }}
                        onFocus={() => setDropdownOpen(true)}
                      />
                      {searchText.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearSearchButton}
                          onPress={() => {
                            setSearchText('');
                            setDropdownOpen(true);
                          }}
                        >
                          <Ionicons name="close" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {dropdownOpen && (
                      <View style={styles.dropdownContainer}>
                        {loadingItems ? (
                          <View style={styles.dropdownLoading}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.dropdownLoadingText}>Cargando objetos...</Text>
                          </View>
                        ) : filteredItems.length === 0 ? (
                          <View style={styles.dropdownEmpty}>
                            <Ionicons name="cube" size={24} color={Colors.textLight} />
                            <Text style={styles.dropdownEmptyText}>
                              {searchText.trim()
                                ? 'No se encontraron objetos'
                                : 'No tienes objetos alquilados actualmente'}
                            </Text>
                          </View>
                        ) : (
                          <FlatList
                            data={filteredItems}
                            renderItem={renderDropdownItem}
                            keyExtractor={(item) => `${item.kitId}-${item.itemId}`}
                            style={styles.dropdownList}
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                          />
                        )}
                      </View>
                    )}
                  </View>
                )}

                {errors.relatedItem && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={Colors.error} />
                    <Text style={styles.errorText}>{errors.relatedItem}</Text>
                  </View>
                )}

              {!selectedItem && !dropdownOpen && (
                <Text style={styles.helperText}>
                  Selecciona el objeto dañado de tus alquileres vigentes.
                </Text>
              )}
              </View>
            </Animated.View>
          )}

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[
                commonStyles.input,
                styles.descriptionInput,
                errors.description && commonStyles.inputError,
              ]}
              placeholder="Describe la incidencia con detalle..."
              placeholderTextColor={Colors.textLight}
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                clearErrors();
              }}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {description.length}/1000
            </Text>
            {errors.description && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{errors.description}</Text>
              </View>
            )}
          </View>

          {/* Error general */}
          {errors.general && (
            <View style={styles.generalError}>
              <Ionicons name="warning" size={16} color={Colors.error} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Botón de envío */}
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <View style={styles.submitContent}>
                <Ionicons name="send" size={20} color={Colors.textWhite} />
                <Text style={commonStyles.primaryButtonText}>Enviar Incidencia</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  animatedSection: {
    overflow: 'visible',
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  descriptionInput: {
    height: 140,
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  typeContainer: {
    gap: Spacing.md,
  },
  typeOption: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  typeLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
  },
  typeLabelSelected: {
    color: Colors.textWhite,
  },
  typeDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xxl,
  },
  typeDescriptionSelected: {
    color: Colors.textMuted,
  },

  // Estilos del desplegable con búsqueda
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: Spacing.xxl + Spacing.sm,
    paddingRight: Spacing.xxl,
  },
  clearSearchButton: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.xs,
  },
  dropdownContainer: {
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownList: {
    maxHeight: 280,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dropdownItemTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium as '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownItemDetails: {
    marginLeft: Spacing.xl + Spacing.sm,
    gap: 2,
  },
  dropdownDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropdownDetailText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  dropdownLoading: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdownLoadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  dropdownEmpty: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdownEmptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Tarjeta del objeto seleccionado
  selectedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  selectedItemTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.primary,
    flex: 1,
  },
  selectedItemDetail: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing.xl + Spacing.sm,
  },
  clearItemButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#fdf0f0',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  generalErrorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    flexShrink: 1,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateIncidentScreen;