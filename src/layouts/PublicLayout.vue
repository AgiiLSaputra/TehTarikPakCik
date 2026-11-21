<script setup>
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()
</script>

<template>
  <div class="public-layout">
    <AppNavbar v-if="!route.meta.bare" />
    <main class="public-main">
      <RouterView />
    </main>
    <AppFooter v-if="!route.meta.bare" />
  </div>
</template>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.public-main {
  flex: 1;
}
</style>
