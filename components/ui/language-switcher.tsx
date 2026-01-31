'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSystemStore } from '@/lib/stores/system-store'
import { useAgentStore } from '@/lib/stores/agent-store'

const languages = [
  { code: 'am', display: 'አማ', name: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr' },
  { code: 'en', display: 'EN', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'or', display: 'OR', name: 'Oromifa', nativeName: 'Afaan Oromoo', dir: 'ltr' },
  { code: 'ti', display: 'ትግ', name: 'Tigrigna', nativeName: 'ትግርኛ', dir: 'ltr' },
  // { code: 'so', display: 'so', name: 'Somali', nativeName: 'Soomaali', dir: 'ltr' },
]

export function LanguageSwitcher() {
  const { activeAgentId } = useAgentStore();
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const setLocaleChanged = useSystemStore(state => state.setLocaleChanged)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  // const changeLanguage = (lng: string) => {
  //   if (lng === i18n.language) return

  //   i18n.changeLanguage(lng)
  //   localStorage.setItem('i18nextLng', lng)
  //   document.documentElement.lang = lng
  //   document.documentElement.dir = 'ltr'

  //   const segments = pathname.split('/')
  //   segments[1] = lng
  //   // router.push(segments.join('/'))
  //   const path = segments.join("/")
  //   const params = new URLSearchParams({ agentId: String(activeAgentId) })

  //   router.push(`${path}?${params.toString()}`)
  // }


  const changeLanguage = (lng: string) => {
    if (lng === i18n.language) return

    i18n.changeLanguage(lng)
    localStorage.setItem("i18nextLng", lng)

    const segments = pathname.split("/")
    segments[1] = lng

    const params = new URLSearchParams(window.location.search)
    params.set("agentId", String(activeAgentId))

    router.push(`${segments.join("/")}?${params.toString()}`)
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 text-sm font-medium" aria-label={t('common:languages.switch', 'Switch language')}>
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <span className="sm:hidden">{currentLanguage.display}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map(lang => (
          <DropdownMenuItem key={lang.code} onClick={() => {
            changeLanguage(lang.code)
            setLocaleChanged(true)
          }} className={`cursor-pointer ${i18n.language === lang.code ? 'bg-accent' : ''}`}>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
