<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="dashboard-layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="dash-main">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="dash-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--color-bg);
}

.dash-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
}

.dash-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  padding: 28px 32px 48px;
}

@media (max-width: 1024px) {
  .dash-main {
    margin-left: 0;
  }

  .dash-content {
    padding-inline: 20px;
  }
}

@media (max-width: 560px) {
  .dash-content {
    padding: 20px 16px 40px;
  }
}
</style>
