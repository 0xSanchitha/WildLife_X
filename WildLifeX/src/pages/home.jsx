import React from 'react'
import Hero from '../components/home/Hero'
import Features from '../components/home/features'
import AboutUs from '../components/home/about'
import End from '../components/home/ending'

export default function home() {
  return (
    <>
      <Hero />
      <AboutUs />
      <Features />
      <End />
    </>
  )
}