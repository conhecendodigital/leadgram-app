'use client'

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function OnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(true)

  useEffect(() => {
    const tourCompleted = localStorage.getItem('dashboard-tour-completed')

    if (!tourCompleted) {
      setHasSeenTour(false)

      const timer = setTimeout(() => {
        startTour()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: 'header h1',
          popover: {
            title: 'Bem-vindo ao Leadgram!',
            description: 'Vamos fazer um tour rapido para voce conhecer as principais funcionalidades do dashboard.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="quick-actions"]',
          popover: {
            title: 'Acoes Rapidas',
            description: 'Aqui voce pode criar novas ideias, fazer upload, configurar automacoes e acessar seu Instagram.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '[role="search"]',
          popover: {
            title: 'Filtros Inteligentes',
            description: 'Use os filtros para visualizar apenas o que importa: ideias, videos gravados ou posts publicados.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5',
          popover: {
            title: 'Metricas Principais',
            description: 'Acompanhe suas visualizacoes, curtidas, comentarios e engajamento em tempo real.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.lg\\:col-span-2 > div:first-child',
          popover: {
            title: 'Grafico de Performance',
            description: 'Veja como suas metricas evoluem ao longo do tempo. Escolha entre 7, 30 ou 90 dias.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '.lg\\:col-span-2 > div:nth-child(2)',
          popover: {
            title: 'Comparacao de Plataformas',
            description: 'Descubra qual plataforma (Instagram, TikTok, YouTube) traz melhores resultados.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '.lg\\:col-span-2 > div:nth-child(3)',
          popover: {
            title: 'Insights Inteligentes',
            description: 'Receba sugestoes personalizadas baseadas nos seus dados para melhorar seu desempenho.',
            side: 'top',
            align: 'start'
          }
        },
        {
          popover: {
            title: 'Pronto para comecar!',
            description: 'Agora voce ja conhece as principais funcionalidades. Explore e crie conteudos incriveis!',
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem('dashboard-tour-completed', 'true')
        setHasSeenTour(true)
      }
    })

    driverObj.drive()
  }

  return (
    <>
      {hasSeenTour && (
        <button
          onClick={startTour}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label="Reiniciar tour guiado"
          title="Ver tour novamente"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}
    </>
  )
}
