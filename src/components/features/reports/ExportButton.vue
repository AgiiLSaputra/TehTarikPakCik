<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'

defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['export'])
</script>

<template>
  <BaseButton
    variant="secondary"
    :disabled="disabled"
    :loading="loading"
    @click="emit('export')"
  >
    <BaseIcon name="download" :size="17" />
    Unduh CSV
  </BaseButton>
</template>
