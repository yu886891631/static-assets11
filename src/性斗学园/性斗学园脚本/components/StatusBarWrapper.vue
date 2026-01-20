<template>
  <StatusBar :isVisible="isVisible" @close="close" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatusBar from './StatusBar.vue';

// 全局状态管理
const globalAny = window as any;
if (!globalAny.__statusBarState) {
  const isVisibleRef = ref(false);
  globalAny.__statusBarState = {
    isVisible: isVisibleRef,
    toggle: () => {
      isVisibleRef.value = !isVisibleRef.value;
    },
  };
}

const isVisible = globalAny.__statusBarState.isVisible;

const close = () => {
  isVisible.value = false;
};
</script>
