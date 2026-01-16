<template>
  <div class="app">
    <!-- Contenido principal - Todo en una vista -->
    <main class="main-content">
      <BookList />
    </main>


    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </div>
</template>

<script setup>
import BookList from './components/BookList.vue'
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.logo-icon {
  font-size: 24px;
  color: #6366f1;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

.tech-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Contenido principal - Ocupa todo el espacio disponible */
.main-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}
</style>