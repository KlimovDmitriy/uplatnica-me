<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <details class="disclosure">
    <summary>{{ t('reference.codes') }}</summary>
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">
              {{ t('reference.municipality') }}
            </th>
            <th scope="col">
              {{ t('reference.code') }}
            </th>
            <th scope="col">
              {{ t('reference.propertyTax') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in MUNICIPALITIES"
            :key="m.code"
          >
            <td>{{ m.name }}</td>
            <td class="mono">
              {{ m.code }}
            </td>
            <td class="mono">
              {{ m.accounts.nepokretnosti ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>
