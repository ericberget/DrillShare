'use client'

import { useEffect, ReactNode } from 'react'
import { useFirebase } from '@/contexts/FirebaseContext'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useFirebase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 