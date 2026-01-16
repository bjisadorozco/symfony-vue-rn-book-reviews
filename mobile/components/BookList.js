import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.20.90:8000/api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el formulario de reseña
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/books`);
    //   console.log('Libros recibidos:', response.data);
      
      // Validar que los libros tengan ID
      const validBooks = response.data.filter(book => {
        const hasId = book.id !== undefined && book.id !== null;
        if (!hasId) {
          console.warn(`Libro sin ID: ${book.title}`);
        }
        return hasId;
      });
      
      setBooks(validBooks);
      
      // Si hay libros y no hay selección, seleccionar el primero
      if (validBooks.length > 0 && !selectedBookId) {
        setSelectedBookId(validBooks[0].id);
      }
    } catch (err) {
      setError('Error al cargar libros: ' + (err.message || 'Desconocido'));
      console.error('Error fetching books:', err);
      
      if (err.response?.status === 404) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con la API. Verifica:\n1. Que el backend esté corriendo\n2. Que la IP sea correcta\n3. Que no haya bloqueos de CORS',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRating = (rating) => {
    if (!rating || rating === 'null') return '0.00';
    return parseFloat(rating).toFixed(2);
  };

  // Función para obtener el libro seleccionado por su ID
  const getSelectedBook = () => {
    return books.find(book => book.id === selectedBookId) || books[0];
  };

  // Función para enviar la reseña
  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    if (!selectedBookId) {
      Alert.alert('Error', 'Por favor selecciona un libro');
      return;
    }

    const selectedBook = getSelectedBook();
    if (!selectedBook) {
      Alert.alert('Error', 'No se ha seleccionado un libro válido');
      return;
    }

    try {
      setSubmitting(true);
      
      // Usar el ID real del backend
      const reviewData = {
        book_id: selectedBook.id,
        rating: rating,
        comment: comment.trim() || null
      };

      console.log('Enviando reseña a:', `${API_URL}/reviews`);
      console.log('Datos enviados:', reviewData);
      
      const response = await axios.post(`${API_URL}/reviews`, reviewData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.status === 201) {
        Alert.alert(
          '¡Éxito!',
          'Reseña añadida correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario
                setRating(0);
                setComment('');
                fetchBooks(); // Recargar los libros
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error adding review:', err);
      console.error('Error response data:', err.response?.data);
      
      let errorMessage = 'No se pudo añadir la reseña. Intenta nuevamente.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Componente para mostrar las estrellas de calificación
  const RatingStars = ({ value, editable = false, onSelect, size = 32 }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <View style={styles.starsContainer}>
        {stars.map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => editable && onSelect && onSelect(star)}
            disabled={!editable}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              { fontSize: size },
              star <= value ? styles.starFilled : styles.starEmpty
            ]}>
              {star <= value ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
        {value > 0 && (
          <Text style={styles.ratingValue}>
            {value}/5
          </Text>
        )}
      </View>
    );
  };

  // Efecto para cargar los libros
  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando libros...</Text>
      </View>
    );
  }

  if (error && books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Biblioteca Móvil</Text>
        <Text style={styles.headerSubtitle}>Consumiendo API Symfony</Text>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchBooks}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? 'Cargando...' : '🔄 Refrescar'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {books.length} {books.length === 1 ? 'libro' : 'libros'}
          </Text>
        </View>
      </View>

      {/* ScrollView principal que contiene todo */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* SECCIÓN: Libros existentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Catálogo de Libros</Text>
          <View style={styles.booksContainer}>
            {books.map((book) => {
              const ratingNum = parseFloat(book.average_rating) || 0;
              const isSelected = selectedBookId === book.id;
              
              // Determinar clase de rating como en Vue
              let ratingClass = styles.ratingLow;
              if (ratingNum >= 4) ratingClass = styles.ratingHigh;
              else if (ratingNum >= 3) ratingClass = styles.ratingMedium;
              
              return (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.bookCard, ratingClass]}
                  onPress={() => setSelectedBookId(book.id)}
                >
                  <View style={styles.bookMain}>
                    <View style={styles.bookIcon}>
                      <Text style={styles.bookIconText}>📚</Text>
                    </View>
                    <View style={styles.bookInfo}>
                      <Text style={styles.bookTitleText}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <View style={styles.bookMeta}>
                        <Text style={styles.bookMetaItem}>
                          📅 {book.published_year}
                        </Text>
                        <Text style={styles.bookMetaItem}>
                          ⭐ {formatRating(book.average_rating)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bookRating}>
                    <View style={styles.starsSmall}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text 
                          key={star} 
                          style={[
                            styles.starSmall,
                            star <= Math.floor(ratingNum) ? styles.starFilledSmall : styles.starEmptySmall
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                    <View style={styles.ratingScore}>
                      <Text style={styles.score}>{formatRating(book.average_rating)}</Text>
                      <Text style={styles.max}>/5</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECCIÓN: Formulario para añadir reseña */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✍️ Nueva Reseña</Text>
          
          <View style={styles.formCard}>
            {/* Selector de libro */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                📖 Seleccionar Libro
              </Text>
              <View style={styles.bookOptions}>
                {books.map((book) => {
                  const isSelected = selectedBookId === book.id;
                  
                  return (
                    <TouchableOpacity
                      key={book.id}
                      style={[
                        styles.bookOption,
                        isSelected && styles.bookOptionSelected
                      ]}
                      onPress={() => setSelectedBookId(book.id)}
                    >
                      <View style={styles.optionIcon}>
                        <Text>📚</Text>
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>{book.title}</Text>
                        <Text style={styles.optionRating}>
                          {formatRating(book.average_rating)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Calificación con estrellas */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                ⭐ Calificación (1-5)
              </Text>
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.ratingOption,
                      rating === num && styles.ratingOptionSelected
                    ]}
                    onPress={() => setRating(num)}
                  >
                    <Text style={[
                      styles.ratingOptionStar,
                      rating === num && styles.ratingOptionStarSelected
                    ]}>
                      ★
                    </Text>
                    <Text style={styles.ratingOptionNumber}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comentario */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                💬 Comentario
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Escribe tu reseña aquí..."
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {comment.length}/500 caracteres
              </Text>
            </View>

            {/* Botón de enviar */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitting || rating === 0 || !selectedBookId) && styles.submitButtonDisabled
              ]}
              onPress={submitReview}
              disabled={submitting || rating === 0 || !selectedBookId}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.submitIcon}>✈️</Text>
                  <Text style={styles.submitButtonText}>Publicar Reseña</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Espacio al final para mejor scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  booksContainer: {
    marginBottom: 10,
  },
  // Estilos para tarjetas de libro como en Vue
  bookCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  bookCardSelected: {
    borderColor: '#3498db',
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
  },
  ratingHigh: {
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  ratingMedium: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  ratingLow: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  bookMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookIconText: {
    color: 'white',
    fontSize: 18,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  bookMetaItem: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bookRating: {
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 80,
  },
  starsSmall: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 4,
  },
  starSmall: {
    fontSize: 12,
  },
  starFilledSmall: {
    color: '#fbbf24',
  },
  starEmptySmall: {
    color: '#cbd5e1',
  },
  ratingScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  max: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 2,
  },
  // Estilos para el formulario como en Vue
  formCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  // Opciones de libros como botones (como en Vue)
  bookOptions: {
    gap: 8,
  },
  bookOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  bookOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f1f5f9',
  },
  optionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  optionRating: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  // Selector de rating como en Vue
  ratingSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingOption: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  ratingOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f1f5f9',
  },
  ratingOptionStar: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  ratingOptionStarSelected: {
    color: '#fbbf24',
  },
  ratingOptionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  // Campos de texto
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 5,
  },
  // Botón de enviar como en Vue
  submitButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  submitIcon: {
    fontSize: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default BookList;