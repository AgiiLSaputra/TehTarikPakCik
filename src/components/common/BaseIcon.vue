<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.8 },
  title: { type: String, default: '' }
})

const ICONS = {
  home: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6.5H9V21H4a1 1 0 0 1-1-1z"/>',
  utensils:
    '<path d="M4 3v6a2 2 0 0 0 4 0V3"/><path d="M6 9v12"/><path d="M16 3c-1.7 1.2-2.5 3-2.5 5.5 0 1.8 1 2.5 2.5 2.5h1V3"/><path d="M17 11v10"/>',
  coffee:
    '<path d="M3 8h13v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2"/><path d="M6 2.5v2M10 2.5v2M14 2.5v2"/>',
  drink:
    '<path d="M6 8h12l-1.4 12.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8z"/><path d="M6.6 12h10.8"/><path d="m13 4 4-2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  cart:
    '<circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.2l2.6 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  trash:
    '<path d="M3.5 6h17"/><path d="M8.5 6V4.2A1.2 1.2 0 0 1 9.7 3h4.6a1.2 1.2 0 0 1 1.2 1.2V6"/><path d="M6 6l1 14.2a1.2 1.2 0 0 0 1.2 1.1h7.6a1.2 1.2 0 0 0 1.2-1.1L18 6"/><path d="M10 10.5v6.5M14 10.5v6.5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7.5 18.5l-4.5 1 1-4.5z"/>',
  printer:
    '<path d="M6.5 9V3.5h11V9"/><path d="M6.5 18h-2A1.5 1.5 0 0 1 3 16.5v-5A1.5 1.5 0 0 1 4.5 10h15a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-2"/><path d="M6.5 14.5h11V21h-11z"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M12 15V3"/>',
  logout:
    '<path d="M9.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4.5"/><path d="m16.5 16.5 4.5-4.5-4.5-4.5"/><path d="M21 12H9"/>',
  user:
    '<path d="M20 21v-1.8a4.2 4.2 0 0 0-4.2-4.2H8.2A4.2 4.2 0 0 0 4 19.2V21"/><circle cx="12" cy="7.5" r="4"/>',
  lock:
    '<rect x="3.5" y="10.5" width="17" height="10.5" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>',
  chart:
    '<path d="M3.5 20.5h17"/><rect x="4.8" y="10.5" width="3.4" height="7" rx="1.1"/><rect x="10.3" y="6.5" width="3.4" height="11" rx="1.1"/><rect x="15.8" y="13" width="3.4" height="4.5" rx="1.1"/>',
  receipt:
    '<path d="M5 2.5h14v19l-2.3-1.6-2.4 1.6-2.3-1.6L9.7 21l-2.3-1.6L5 21.5z"/><path d="M9 7h6M9 11h6M9 15h3.5"/>',
  box:
    '<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z"/><path d="m3.5 7.5 8.5 4.6 8.5-4.6"/><path d="M12 12.1V21"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  cash:
    '<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  wallet:
    '<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19"/><circle cx="16.5" cy="14.5" r="1.2"/>',
  'arrow-right': '<path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/>',
  'arrow-left': '<path d="M19.5 12h-15"/><path d="m10.5 6-6 6 6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  menu: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
  star:
    '<path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9z"/>',
  'map-pin':
    '<path d="M19.5 10.2c0 5.4-7.5 11.3-7.5 11.3S4.5 15.6 4.5 10.2a7.5 7.5 0 0 1 15 0z"/><circle cx="12" cy="10" r="2.8"/>',
  phone:
    '<path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.4 19.4 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.4 19.4 0 0 1-3-8.6A2 2 0 0 1 3.4 2H6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.9a15.5 15.5 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/>',
  sparkles:
    '<path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15.5 19.4 18l2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z"/>',
  alert:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17.2h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5V12M12 8h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
  refresh:
    '<path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3.5 15.6"/><path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9l2.4 2.3"/><path d="M21 4v4.5h-4.5M3 20v-4.5h4.5"/>',
  users:
    '<path d="M16 21v-1.8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21"/><circle cx="9" cy="7" r="3.5"/><path d="M17 4.2a3.5 3.5 0 0 1 0 6.8M22 21v-1.8a4 4 0 0 0-3-3.8"/>',
  filter: '<path d="M4 5h16l-6.2 7.3V20l-3.6-2v-5.7z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 18.4 12.8-12.8"/>',
  list: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12"/><path d="M3.5 6.5h.01M3.5 12h.01M3.5 17.5h.01"/>',
  store:
    '<path d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5"/><path d="M3 9.5 5 3.5h14L21 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M9.5 21v-6h5v6"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
}

const markup = computed(() => ICONS[props.name] || '')
</script>

<template>
  <svg
    class="base-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <title v-if="title">{{ title }}</title>
    <g v-html="markup" />
  </svg>
</template>

<style scoped>
.base-icon {
  flex: none;
  display: block;
}
</style>
