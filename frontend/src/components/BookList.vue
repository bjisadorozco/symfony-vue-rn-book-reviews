<template>
  <div class="dashboard">

    <!-- Contenido principal - Grid de 2 columnas -->
    <div class="main-grid">
      <!-- Columna izquierda: Libros -->
      <div class="column books-column">
        <div class="column-header">
          <h2><i class="fas fa-books"></i> Catálogo de Libros</h2>
        </div>
        <div class="books-grid">
          <div 
            v-for="book in books" 
            :key="book.id" 
            class="book-card"
            :class="getRatingClass(book.average_rating)"
          >
            <div class="book-main">
              <div class="book-icon">
                <i class="fas fa-book"></i>
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-meta">
                  <span><i class="fas fa-calendar"></i> {{ book.published_year }}</span>
                  <span><i class="fas fa-hashtag"></i> ID: {{ book.id }}</span>
                </div>
              </div>
            </div>
            <div class="book-rating">
              <div class="stars">
                <i 
                  v-for="n in 5" 
                  :key="n" 
                  class="fas fa-star"
                  :class="{ 'filled': n <= getStarCount(book.average_rating) }"
                ></i>
              </div>
              <div class="rating-score">
                <span class="score">{{ formatRating(book.average_rating) }}</span>
                <span class="max">/5</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botón de refrescar - NUEVO -->
        <div class="refresh-section">
          <button 
            @click="refreshBooks" 
            :disabled="loading"
            class="btn-refresh"
          >
            <template v-if="loading">
              <i class="fas fa-spinner fa-spin"></i> Cargando...
            </template>
            <template v-else>
              <i class="fas fa-sync-alt"></i> Actualizar Lista
            </template>
          </button>
          <div class="stats-info">
            <span class="stat">
              <i class="fas fa-book"></i>
              <strong>{{ books.length }}</strong> libros
            </span>
            <span class="stat">
              <i class="fas fa-star"></i>
              <strong>{{ averageRatingOverall }}</strong> promedio
            </span>
          </div>
        </div>
      </div>

      <!-- Columna derecha: Formulario de reseña -->
      <div class="column form-column">
        <div class="column-header">
          <h2><i class="fas fa-edit"></i> Nueva Reseña</h2>
        </div>
        <div class="review-form">
          <!-- Libro -->
          <div class="form-group">
            <label><i class="fas fa-book"></i> Seleccionar Libro</label>
            <div class="book-options">
              <div 
                v-for="book in books" 
                :key="book.id"
                class="book-option"
                :class="{ 'selected': newReview.bookId === book.id }"
                @click="newReview.bookId = book.id"
              >
                <div class="option-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="option-info">
                  <div class="option-title">{{ book.title }}</div>
                  <div class="option-rating">{{ formatRating(book.average_rating) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rating -->
          <div class="form-group">
            <label><i class="fas fa-star"></i> Calificación (1-5)</label>
            <div class="rating-selector">
              <div 
                v-for="n in 5" 
                :key="n"
                class="rating-option"
                :class="{ 'selected': newReview.rating === n }"
                @click="newReview.rating = n"
              >
                <i class="fas fa-star"></i>
                <span>{{ n }}</span>
              </div>
            </div>
          </div>

          <!-- Comentario -->
          <div class="form-group">
            <label><i class="fas fa-comment"></i> Comentario</label>
            <textarea 
              v-model="newReview.comment" 
              placeholder="Escribe tu reseña aquí..."
              rows="3"
              class="comment-input"
            ></textarea>
          </div>

          <!-- Botón de enviar -->
          <button 
            @click="submitReview" 
            :disabled="!isValidReview || submitting"
            class="btn-submit"
          >
            <template v-if="submitting">
              <i class="fas fa-spinner fa-spin"></i> Enviando...
            </template>
            <template v-else>
              <i class="fas fa-paper-plane"></i> Publicar Reseña
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div v-if="showToast" class="toast" :class="toastType">
      <i :class="toastIcon"></i>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Estado
const books = ref([])
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const toastIcon = ref('')

// Nueva reseña
const newReview = ref({
  bookId: '',
  rating: '',
  comment: ''
})

// Métodos
const fetchBooks = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get('/api/books')
    books.value = response.data
    
    // Si hay libros, seleccionar el primero automáticamente
    if (books.value.length > 0 && !newReview.value.bookId) {
      newReview.value.bookId = books.value[0].id
    }
  } catch (err) {
    error.value = 'Error al cargar libros'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Método para refrescar libros
const refreshBooks = async () => {
  await fetchBooks()
  showToastMessage('Lista actualizada', 'success', 'fas fa-check-circle')
}

const submitReview = async () => {
  submitting.value = true
  
  try {
    // Usar el ID real del backend directamente
    await axios.post('/api/reviews', {
      book_id: newReview.value.bookId, // Ya viene como número del backend
      rating: parseInt(newReview.value.rating),
      comment: newReview.value.comment
    })
    
    showToastMessage('Reseña agregada', 'success', 'fas fa-check-circle')
    newReview.value = { bookId: '', rating: '', comment: '' }
    
    // Si hay libros, seleccionar el primero después de enviar
    if (books.value.length > 0) {
      newReview.value.bookId = books.value[0].id
    }
    
    // Actualizar automáticamente la lista después de añadir reseña
    setTimeout(refreshBooks, 500)
    
  } catch (err) {
    showToastMessage('❌ Error: ' + (err.response?.data?.error || err.message), 'error', 'fas fa-exclamation-circle')
  } finally {
    submitting.value = false
  }
}

const showToastMessage = (message, type, icon) => {
  toastMessage.value = message
  toastType.value = type
  toastIcon.value = icon
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const formatRating = (rating) => {
  if (!rating || rating === 'null') return '0.00'
  return parseFloat(rating).toFixed(2)
}

const getStarCount = (rating) => {
  return Math.floor(parseFloat(rating) || 0)
}

const getRatingClass = (rating) => {
  const num = parseFloat(rating) || 0
  if (num >= 4) return 'rating-high'
  if (num >= 3) return 'rating-medium'
  return 'rating-low'
}

// Computed
const isValidReview = computed(() => {
  return newReview.value.bookId && 
         newReview.value.rating && 
         newReview.value.comment.trim()
})

const averageRatingOverall = computed(() => {
  if (books.value.length === 0) return '0.00'
  const total = books.value.reduce((sum, book) => {
    return sum + (parseFloat(book.average_rating) || 0)
  }, 0)
  return (total / books.value.length).toFixed(2)
})

// Ciclo de vida
onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Grid principal - Todo en una vista */
.main-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

.column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.column-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Columna de libros */
.books-column {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.books-grid {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
  margin-bottom: 16px;
}

/* Sección de refrescar - NUEVO */
.refresh-section {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.btn-refresh {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-refresh:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.stat i {
  color: #6366f1;
  font-size: 12px;
}

.stat strong {
  color: #1e293b;
  font-weight: 600;
}

/* Tarjeta de libro compacta */
.book-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.book-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.book-card.rating-high {
  border-left: 3px solid #10b981;
}

.book-card.rating-medium {
  border-left: 3px solid #f59e0b;
}

.book-card.rating-low {
  border-left: 3px solid #ef4444;
}

.book-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.book-icon {
  width: 40px;
  height: 40px;
  background: #6366f1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
}

.book-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.book-author {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
}

.book-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.book-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-rating {
  text-align: center;
  min-width: 80px;
  margin-left: 12px;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 4px;
}

.stars .fa-star {
  font-size: 12px;
  color: #cbd5e1;
}

.stars .fa-star.filled {
  color: #fbbf24;
}

.rating-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.rating-score .score {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.rating-score .max {
  font-size: 12px;
  color: #94a3b8;
}

/* Columna de formulario */
.form-column {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.review-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  margin: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Opciones de libros */
.book-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.book-option:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.book-option.selected {
  border-color: #6366f1;
  background: #f1f5f9;
}

.option-icon {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 2px;
}

.option-rating {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

/* Selector de rating */
.rating-selector {
  display: flex;
  gap: 8px;
}

.rating-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-option:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.rating-option.selected {
  border-color: #6366f1;
  background: #f1f5f9;
  color: #6366f1;
}

.rating-option i {
  font-size: 16px;
  color: #cbd5e1;
}

.rating-option.selected i {
  color: #fbbf24;
}

.rating-option span {
  font-size: 14px;
  font-weight: 600;
}

/* Campo de comentario */
.comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Botón de enviar */
.btn-submit {
  margin-top: auto;
  background: #10b981;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #0da271;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scrollbar personalizada */
.books-grid::-webkit-scrollbar {
  width: 6px;
}

.books-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.books-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.books-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>