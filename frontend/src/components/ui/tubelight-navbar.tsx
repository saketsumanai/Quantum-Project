"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url?: string
  icon: LucideIcon
  id?: string
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab?: string
  onTabChange?: (nameOrId: string) => void
}

export function NavBar({ items, className, activeTab: controlledActiveTab, onTabChange }: NavBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.id || items[0]?.name)
  const [isMobile, setIsMobile] = useState(false)

  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSelect = (item: NavItem) => {
    const targetKey = item.id || item.name
    setInternalActiveTab(targetKey)
    if (onTabChange) {
      onTabChange(targetKey)
    }
  }

  return (
    <div
      className={cn(
        "z-50 select-none",
        className || "fixed top-5 left-1/2 -translate-x-1/2"
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c10]/90 border border-white/[0.14] backdrop-blur-2xl py-2 px-2.5 rounded-full shadow-[0_16px_48px_rgba(0,0,0,0.75)]">
        {items.map((item) => {
          const Icon = item.icon
          const itemKey = item.id || item.name
          const isActive = currentTab === itemKey || currentTab === item.name

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSelect(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-colors duration-200 flex items-center gap-2 outline-none",
                "text-zinc-400 hover:text-white",
                isActive && "text-white font-bold"
              )}
            >
              <Icon size={17} strokeWidth={2.2} className={cn("transition-colors", isActive ? "text-white" : "text-zinc-400")} />
              <span className="hidden md:inline whitespace-nowrap text-[0.85rem] tracking-tight">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white/[0.10] rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 340,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-1 bg-white rounded-t-full shadow-[0_0_16px_rgba(255,255,255,1)]">
                    <div className="absolute w-16 h-7 bg-white/20 rounded-full blur-md -top-2.5 -left-2" />
                    <div className="absolute w-12 h-6 bg-white/25 rounded-full blur-md -top-1" />
                    <div className="absolute w-6 h-5 bg-white/35 rounded-full blur-sm top-0 left-3" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
