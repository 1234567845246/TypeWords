import { Theme } from '../../types'

let darkModeMediaQuery: MediaQueryList | null = null
let darkModeListener: ((event: MediaQueryListEvent) => void) | null = null

export function setTheme(theme: Theme) {
    if (!darkModeMediaQuery) {
        darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    }
    if (theme === 'system') {
        document.body.setAttribute('data-theme', darkModeMediaQuery.matches ? 'dark' : 'light')
        if (!darkModeListener) {
            darkModeListener = (event: MediaQueryListEvent) => {
                document.body.setAttribute('data-theme', event.matches ? 'dark' : 'light')
            }
            darkModeMediaQuery.addEventListener('change', darkModeListener)
        }
    } else {
        document.body.setAttribute('data-theme', theme)
        if (darkModeMediaQuery && darkModeListener) {
            darkModeMediaQuery.removeEventListener('change', darkModeListener)
            darkModeListener = null
        }
    }
     window.electronAPI.setTheme(theme)
}