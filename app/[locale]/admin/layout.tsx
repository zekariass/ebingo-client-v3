// import type React from "react"
// import { AdminSidebar } from "@/components/admin/admin-sidebar"
// import { AdminHeader } from "@/components/admin/admin-header"

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="flex h-screen bg-background">
//       <AdminSidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <AdminHeader />
//         <main className="flex-1 overflow-auto p-6">{children}</main>
//       </div>
//     </div>
//   )
// }


"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleMenuToggle = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <AdminSidebar isMobile onLinkClick={closeSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
