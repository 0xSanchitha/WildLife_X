import React, { useEffect, useState } from 'react'

import { BACKEND_URL } from '../constants/api'

const API_URL = `${BACKEND_URL}/auth`

const UserIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </svg>
)

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1720] text-white flex justify-center items-center">
        <p className="text-[#7AAACE] animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f1720] text-white flex justify-center items-center">
        <p className="text-[#7AAACE]">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1720] text-white flex justify-center items-center">
      <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">

        {/* Avatar + name */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-[#355872] flex items-center justify-center text-[#7AAACE]">
            <UserIcon className="w-14 h-14" />
          </div>

          <h1 className="mt-4 text-3xl font-bold capitalize">
            {user.username}
          </h1>

          <p className="text-[#7AAACE] mt-1 text-sm">
            {user.email}
          </p>

          <p className="text-[#7AAACE]/70 mt-1 text-sm">
            Wildlife Explorer
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4">
          <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-[#F7F8F0]/70 text-sm">Ecosystems Created</span>
            <span className="font-bold text-[#7AAACE]">0</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-[#F7F8F0]/70 text-sm">Animals Viewed</span>
            <span className="font-bold text-[#7AAACE]">0</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-[#F7F8F0]/70 text-sm">Member Since</span>
            <span className="font-bold text-[#7AAACE]">2026</span>
          </div>
        </div>

      </div>
    </div>
  )
}