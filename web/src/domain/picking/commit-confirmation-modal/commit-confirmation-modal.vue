<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  totalArrivals: number
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const commitConfirmationModal = ref<HTMLDialogElement | null>(null)

watch(
  [commitConfirmationModal, () => props.isOpen],
  ([confirmationModal, isOpen]) => {
    if (confirmationModal) {
      if (isOpen) {
        confirmationModal.showModal()
      } else {
        confirmationModal.close()
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <dialog ref="commitConfirmationModal" class="modal" @close="$emit('close')">
    <div class="modal-box app-modal-box max-w-md">
      <h3 class="text-lg font-semibold text-base-content">Commit {{ totalArrivals }} pick?</h3>
      <p class="mt-2 text-sm text-base-content/70">
        Pick yang dipilih dikirim ke backend untuk relokasi hiposenter. Hasilnya menggantikan solusi yang sedang
        tampil.
      </p>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="$emit('close')">Batal</button>
        <button class="btn btn-primary" @click="$emit('confirm')">Commit</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button aria-label="Tutup">close</button></form>
  </dialog>
</template>
