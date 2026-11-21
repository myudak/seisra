<script setup lang="ts">
const model = defineModel<string>()

withDefaults(
  defineProps<{
    label?: string
    error?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    autocomplete?: string
    icon?: string
  }>(),
  {
    disabled: false,
    placeholder: '',
    error: '',
    type: 'text',
    label: '',
    autocomplete: undefined,
    icon: ''
  }
)
</script>

<template>
  <label class="form-control w-full">
    <div v-if="!!label" class="mb-1.5">
      <span class="text-sm font-medium text-base-content/80">{{ label }}</span>
    </div>
    <div class="relative">
      <v-icon
        v-if="icon"
        :name="icon"
        scale="0.85"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
      <input
        v-model="model"
        :type="type"
        class="input input-bordered w-full bg-base-100 placeholder:text-base-content/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        :class="{ 'pl-9': icon, 'input-error': !!error }"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :placeholder="placeholder" />
    </div>
    <div v-if="!!error" class="mt-1">
      <span class="text-xs text-error">{{ error }}</span>
    </div>
  </label>
</template>
