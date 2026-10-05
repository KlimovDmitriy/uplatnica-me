<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <details class="codes">
    <summary>{{ t('reference.codes') }}</summary>
    <table>
      <thead>
        <tr>
          <th>{{ t('reference.municipality') }}</th>
          <th>{{ t('reference.code') }}</th>
          <th>{{ t('reference.propertyTax') }}</th>
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
            {{ m.accounts.nepokretnosti }}
          </td>
        </tr>
      </tbody>
    </table>
  </details>
</template>

<style scoped>
summary { cursor: pointer; font-size: 13px; }
table { border-collapse: collapse; font-size: 13px; margin-top: 6px; }
th { text-align: left; font-weight: 400; color: #777; padding: 3px 16px 3px 0; }
td { padding: 3px 16px 3px 0; border-bottom: 1px solid #e5e5e5; }
</style>
