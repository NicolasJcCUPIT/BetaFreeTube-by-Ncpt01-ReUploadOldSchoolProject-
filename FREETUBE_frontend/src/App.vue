<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import { useStore } from 'vuex'

const store = useStore()

store.dispatch('tryAutoLogin')
</script>

<style>
body {
background-color: #2d3b3f;
}
</style>
