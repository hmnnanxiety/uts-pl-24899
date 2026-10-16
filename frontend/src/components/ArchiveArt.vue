<script setup lang="ts">
withDefaults(defineProps<{ category?: string }>(), { category: 'camera' })
</script>
<template>
  <svg class="archive-art" viewBox="0 0 500 320" fill="none" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.2" opacity=".15">
      <path d="M20 80h460M20 240h460M90 20v280M410 20v280" />
      <circle cx="250" cy="160" r="130" />
      <path d="M238 160h24m-12-12v24" />
    </g>
    <g v-if="category === 'camera'" stroke="currentColor" stroke-linejoin="round">
      <path d="M106 119h65l21-31h102l20 31h80v127H106Z" fill="#20201e" stroke-width="2" />
      <path d="M107 143h285M130 119v126m230-126v126M194 88l-5 31h124" opacity=".6" />
      <rect x="125" y="107" width="34" height="12" rx="3" />
      <rect x="327" y="130" width="22" height="10" rx="2" />
      <circle cx="250" cy="180" r="70" fill="#282825" stroke-width="2" />
      <circle cx="250" cy="180" r="60" />
      <circle cx="250" cy="180" r="48" stroke-width="4" opacity=".4" />
      <circle cx="250" cy="180" r="36" />
      <path d="m250 144 31 18v36l-31 18-31-18v-36Z" opacity=".7" />
      <path d="m250 144 15 27 16 27h-31l-31-1 15-26Z" opacity=".35" />
      <path d="M235 99h28m-28 5h28M116 225h8" />
      <circle cx="374" cy="132" r="3" fill="currentColor" />
    </g>
    <g v-else-if="category === 'lens'" stroke="currentColor" stroke-width="2">
      <path d="m167 95 150-28 48 162-150 29Z" fill="#20201e" />
      <ellipse cx="191" cy="176" rx="47" ry="85" transform="rotate(-17 191 176)" fill="#282825" />
      <ellipse cx="191" cy="176" rx="34" ry="67" transform="rotate(-17 191 176)" />
      <ellipse cx="191" cy="176" rx="22" ry="47" transform="rotate(-17 191 176)" opacity=".5" />
      <path d="m265 77 49 162m-36-164 48 162m-35-164 49 162m-35-164 49 162" opacity=".45" />
    </g>
    <g v-else-if="category === 'lighting'" stroke="currentColor" stroke-width="2">
      <path d="m211 49 91 8 58 60-8 80-71 49-85-15-47-69 14-72Z" fill="#282825" />
      <path d="m211 49 70 197m21-189-106 174m164-114-211 45m14-72 189 107" opacity=".25" />
      <path d="M257 244v37m0-17-39 28m39-28 39 28" />
      <circle cx="254" cy="148" r="20" opacity=".5" />
    </g>
    <g v-else-if="category === 'tripod'" stroke="currentColor" stroke-width="3">
      <rect x="225" y="49" width="50" height="25" rx="4" fill="#282825" />
      <path
        d="M250 74v84m-14-72h28v72h-28ZM241 158l-71 125m89-125 71 125m-80-125v125M268 57l55 15"
      />
      <path d="m210 209 40-25 40 25" opacity=".5" />
    </g>
    <g v-else stroke="currentColor" stroke-width="2">
      <path d="M141 114h218v139H141Z" fill="#282825" />
      <path d="M213 113V91h74v22m-146 52h218M159 114v138m181-138v138" />
      <rect x="180" y="155" width="22" height="22" rx="3" fill="#20201e" />
      <rect x="298" y="155" width="22" height="22" rx="3" fill="#20201e" />
    </g>
    <g stroke="currentColor" opacity=".5">
      <path d="M32 48V32h16m404 0h16v16M32 272v16h16m404 0h16v-16" />
    </g>
  </svg>
</template>
