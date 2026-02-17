import { createRootRoute, Outlet, useRouterState, useLocation } from "@tanstack/react-router";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../lib/theme";
import { MainNav } from "../components/navigation/MainNav";
import { Toaster } from "../components/ui/toaster";
import { useEffect } from "react";
import Lenis from 'lenis'
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "../index.css";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet, HelmetProvider } from 'react-helmet-async';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading]);

  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Helmet>
            <title>Turkey Clinic Guide</title>
            <meta name="description" content="Find the best dental clinics in Turkey. Compare prices, read reviews, and book your appointment with trusted clinics." />
          </Helmet>
          <div className="min-h-screen bg-background font-sans antialiased selection:bg-yellow-500/30 selection:text-yellow-900 dark:selection:bg-yellow-500/30 dark:selection:text-yellow-100">
            <MainNav />
            <main>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="min-h-screen"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
