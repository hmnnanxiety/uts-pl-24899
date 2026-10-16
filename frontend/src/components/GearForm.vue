<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ArrowUpRight, LoaderCircle, Camera, SlidersHorizontal, AlignLeft } from '@lucide/vue'
import FormField from './FormField.vue'
import { categories, conditions, statuses } from '../lib/gear'
import { gearApi } from '../api/gear'
import { errorMessage, fieldErrors } from '../api/errors'
import { useToast } from '../composables/useToast'
import type { Gear, GearInput, FieldErrors } from '../types'

const props = defineProps<{ initial?: Gear }>()
const emit = defineEmits<{ saved: [item: Gear] }>()
const { notify } = useToast()
const form = reactive<GearInput>({
  code: props.initial?.code || '', name: props.initial?.name || '', brand: props.initial?.brand || '',
  model: props.initial?.model || '', category: props.initial?.category || 'camera',
  condition: props.initial?.condition || 'good', status: props.initial?.status || 'available',
  storage_location: props.initial?.storage_location || '', purchase_date: props.initial?.purchase_date?.slice(0, 10) || '', notes: props.initial?.notes || '',
})
const original = JSON.stringify(form)
const busy = ref(false), saved = ref(false), error = ref(''), errors = ref<FieldErrors>({})
const formElement = ref<HTMLFormElement>()
const dirty = computed(() => !saved.value && JSON.stringify(form) !== original)
const identityFields = [
  { key: 'code', label: 'Inventory code', required: true, max: 32, placeholder: 'e.g. CAM-001' },
  { key: 'name', label: 'Equipment name', required: true, max: 255, placeholder: 'e.g. Studio mirrorless camera' },
  { key: 'brand', label: 'Brand', required: true, max: 100, placeholder: 'e.g. Sony' },
  { key: 'model', label: 'Model', required: false, max: 100, placeholder: 'e.g. Alpha 7 IV' },
] as const

onBeforeRouteLeave(to => {
  if (to.name === 'login' || saved.value) return true
  if (busy.value) return false
  return !dirty.value || window.confirm('Leave without saving your equipment changes?')
})
function beforeUnload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
async function focusError() {
  await nextTick()
  formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus()
}
async function submit() {
  if (busy.value) return
  errors.value = {}; error.value = ''
  const payload: GearInput = {
    ...form, code: form.code.trim(), name: form.name.trim(), brand: form.brand.trim(),
    model: form.model?.trim() || null, storage_location: form.storage_location?.trim() || null,
    purchase_date: form.purchase_date || null, notes: form.notes?.trim() || null,
  }
  for (const field of ['code', 'name', 'brand'] as const) {
    if (!payload[field]) errors.value[field] = ['This field cannot be blank.']
  }
  if (Object.keys(errors.value).length) { error.value = 'Please check the highlighted fields.'; await focusError(); return }
  busy.value = true
  try {
    const item = props.initial ? await gearApi.update(props.initial.id, payload) : await gearApi.create(payload)
    saved.value = true
    notify(props.initial ? 'Equipment record updated.' : 'A new piece added to your archive.')
    emit('saved', item)
  } catch (err) { errors.value = fieldErrors(err); error.value = errorMessage(err); await focusError() }
  finally { busy.value = false }
}
</script>
<template>
  <form ref="formElement" class="equipment-form" @submit.prevent="submit" :aria-busy="busy">
    <div v-if="error" class="alert" role="alert" tabindex="-1">{{ error }}</div>
    <fieldset :disabled="busy"><legend class="sr-only">Equipment details</legend>
      <section class="form-section"><header><span class="section-number">01</span><div><h2><Camera :size="19"/>The essentials</h2><p>Give this piece a clear identity in the archive.</p></div></header><div class="form-grid">
        <FormField v-for="field in identityFields" :key="field.key" :name="field.key" :label="field.label" :required="field.required" :error="errors[field.key]?.[0]" v-slot="attrs"><input :id="attrs.id" v-model="form[field.key]" type="text" :maxlength="field.max" :placeholder="field.placeholder" :required="field.required" :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"></FormField>
        <FormField name="category" label="Category" required :error="errors.category?.[0]" v-slot="attrs"><select :id="attrs.id" v-model="form.category" required :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"><option v-for="option in categories" :key="option.value" :value="option.value">{{ option.label }}</option></select></FormField>
      </div></section>
      <section class="form-section"><header><span class="section-number">02</span><div><h2><SlidersHorizontal :size="19"/>In the studio</h2><p>Let the team know where it is and how it’s doing.</p></div></header><div class="form-grid">
        <FormField name="condition" label="Physical condition" required :error="errors.condition?.[0]" v-slot="attrs"><select :id="attrs.id" v-model="form.condition" required :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"><option v-for="option in conditions" :key="option.value" :value="option.value">{{ option.label }}</option></select></FormField>
        <FormField name="status" label="Availability" required :error="errors.status?.[0]" v-slot="attrs"><select :id="attrs.id" v-model="form.status" required :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"><option v-for="option in statuses" :key="option.value" :value="option.value">{{ option.label }}</option></select></FormField>
        <FormField name="storage_location" label="Storage location" :error="errors.storage_location?.[0]" v-slot="attrs"><input :id="attrs.id" v-model="form.storage_location" maxlength="255" placeholder="e.g. Cabinet A · Shelf 02" :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"></FormField>
        <FormField name="purchase_date" label="Purchase date" :error="errors.purchase_date?.[0]" v-slot="attrs"><input :id="attrs.id" v-model="form.purchase_date" type="date" :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"></FormField>
      </div></section>
      <section class="form-section"><header><span class="section-number">03</span><div><h2><AlignLeft :size="19"/>The finer details</h2><p>A little context goes a long way.</p></div></header><FormField name="notes" label="Notes" :error="errors.notes?.[0]" hint="Care instructions, included accessories, or anything worth remembering." v-slot="attrs"><textarea :id="attrs.id" v-model="form.notes" rows="4" placeholder="What should the team know about this piece?" :aria-invalid="attrs.invalid" :aria-describedby="attrs.describedby"/></FormField></section>
    </fieldset>
    <div class="form-actions"><p><span class="required-mark">*</span> Required fields</p><div class="actions"><RouterLink v-if="!busy" :to="initial ? `/gear/${initial.id}` : '/gear'" class="button">Cancel</RouterLink><button type="submit" class="button primary" :disabled="busy"><LoaderCircle v-if="busy" class="spin" :size="16"/>{{ busy ? 'Saving your equipment…' : initial ? 'Save changes' : 'Add to the archive' }}<ArrowUpRight v-if="!busy" :size="17"/></button></div></div>
  </form>
</template>
