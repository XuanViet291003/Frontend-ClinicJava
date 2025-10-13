<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './lib/auth'
import MainLayout from './components/Layout/MainLayout.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()

// Routes that don't need the main layout
const guestRoutes = ['login', 'admin-login', 'register']

const needsLayout = computed(() => {
  return isAuthenticated.value && !guestRoutes.includes(route.name as string)
})
</script>

<template>
  <div id="app">
    <MainLayout v-if="needsLayout" />
    <router-view v-else />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

html, body, #app { 
  height: 100%; 
  margin: 0; 
  font-family: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
}

/* Global styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn--primary {
  background-color: #007bff;
  color: white;
}

.btn--primary:hover {
  background-color: #0056b3;
}

.btn--secondary {
  background-color: #6c757d;
  color: white;
}

.btn--secondary:hover {
  background-color: #545b62;
}

.btn--success {
  background-color: #28a745;
  color: white;
}

.btn--success:hover {
  background-color: #1e7e34;
}

.btn--danger {
  background-color: #dc3545;
  color: white;
}

.btn--danger:hover {
  background-color: #c82333;
}

.btn--outline {
  background-color: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn--outline:hover {
  background-color: #007bff;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge--pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge--confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge--completed {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge--cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.card__title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* Tables */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control--error {
  border-color: #dc3545;
}

.form-error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

/* Loading */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert--success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert--error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert--warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.alert--info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>


