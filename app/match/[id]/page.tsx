"use client"

import { use } from "react"
import { MatchDetail } from "../../components/MatchDetail"
import { useFootballData } from "../../hooks/useFootballData"
import { useDashboardState } from "../../hooks/useDashboardState"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { SkeletonLoader } from "../../components/SkeletonLoader"
import { BackToTop } from "../../components/BackToTop"
import Link from "next/link"

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export default function MatchPage({ params }: MatchPageProps) {
  const { id } = use(params)
  const { matches, upcomingMatches, isLoading } = useFootballData()
  const { 
    activeTab, 
    setActiveTab
  } = useDashboardState(id)

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto max-w-7xl px-2 md:px-8 py-4 md:py-8 flex-1">
          <SkeletonLoader />
        </div>
        <Footer />
      </div>
    )
  }

  const selectedMatch = [...matches, ...upcomingMatches].find((m) => m.id === id)

  if (!selectedMatch) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto max-w-7xl px-2 md:px-8 py-20 flex-1 text-center">
          <h1 className="text-4xl font-bold text-accent mb-4">Match Not Found</h1>
          <p className="text-secondary mb-8">The match you are looking for does not exist or has been removed.</p>
          <Link 
            href="/" 
            className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block min-h-[48px] active:scale-95 transition-transform duration-150"
          >
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-2 md:px-8 py-4 md:py-8 flex-1">
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-secondary hover:text-accent transition-colors flex items-center gap-2 group min-h-[48px] active:scale-95 transition-transform duration-150"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <MatchDetail 
            selectedMatch={selectedMatch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
