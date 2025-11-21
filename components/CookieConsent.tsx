'use client'

import CookieConsentLib from 'react-cookie-consent'
import Link from 'next/link'

export default function CookieConsent() {
  return (
    <CookieConsentLib
      location="bottom"
      buttonText="Aceitar todos"
      declineButtonText="Apenas essenciais"
      enableDeclineButton
      cookieName="leadgram-cookie-consent"
      style={{
        background: 'linear-gradient(to right, rgba(8, 102, 255, 0.95), rgba(147, 51, 234, 0.95))',
        padding: '20px',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
      }}
      buttonStyle={{
        background: 'white',
        color: '#0866FF',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '10px',
        padding: '12px 24px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      declineButtonStyle={{
        background: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '10px',
        padding: '12px 24px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        marginRight: '10px',
        transition: 'all 0.2s',
      }}
      expires={365}
      onAccept={() => {
        console.log('Cookie consent: All cookies accepted')
      }}
      onDecline={() => {
        console.log('Cookie consent: Only essential cookies')
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 max-w-6xl mx-auto">
        <div className="flex-1">
          <p className="text-white text-sm md:text-base font-medium m-0">
            🍪 Usamos cookies para melhorar sua experiência, analisar o uso da plataforma e personalizar conteúdo.
          </p>
          <p className="text-white/80 text-xs mt-2 m-0">
            Ao clicar em "Aceitar todos", você concorda com o uso de cookies.{' '}
            <Link href="/legal/cookies" className="underline text-white hover:text-white/90">
              Saiba mais
            </Link>
            {' · '}
            <Link href="/legal/privacy" className="underline text-white hover:text-white/90">
              Privacidade
            </Link>
          </p>
        </div>
      </div>
    </CookieConsentLib>
  )
}
