import { ref } from 'vue'

const KEY = 'will-demo-admin-theme'
const THEMES = ['light', 'tech', 'aurora']

export const adminTheme = ref(THEMES.includes(localStorage.getItem(KEY)) ? localStorage.getItem(KEY) : 'light')

export function setAdminTheme(t) {
  adminTheme.value = THEMES.includes(t) ? t : 'light'
  localStorage.setItem(KEY, adminTheme.value)
}
