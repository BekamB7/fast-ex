"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Phone, Rocket } from "lucide-react";

const navItems = [
  {
    name: "Home",
    icon: Home,
    path: "/",
  },
  {
    name: "About",
    icon: Info,
    path: "/about",
  },
  {
    name: "Contact",
    icon: Phone,
    path: "/contact",
  },
  {
    name: "Get Going",
    icon: Rocket,
    path: "/get-going",
  },
];

const spring = {
  type: "spring",
  stiffness: 500,
  damping: 32,
  mass: 0.7,
};

export function MobileBottomNav() {
  const pathname = usePathname();

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/exam")
  ) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
        delay: 0.1,
      }}
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        px-3
        pb-[max(0.65rem,env(safe-area-inset-bottom))]
        pointer-events-none
        md:hidden
      "
    >
      <div
        className="
          pointer-events-auto
          mx-auto
          w-full
          max-w-[720px]
          overflow-hidden
          rounded-[1.5rem]
          border
          border-primary/15
          bg-white/90
          p-1.5
          shadow-[0_-10px_40px_rgba(27,61,42,0.12)]
          backdrop-blur-xl
          supports-[backdrop-filter]:bg-white/80
        "
      >
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className="relative min-w-0"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={spring}
                  className={`
                    relative
                    flex
                    min-h-[58px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    gap-0.5
                    overflow-hidden
                    rounded-[1.1rem]
                    px-1
                    py-1.5
                    ${
                      isActive
                        ? "text-primary"
                        : "text-slate-400 hover:text-primary"
                    }
                  `}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBackground"
                        transition={spring}
                        className="
                          absolute
                          inset-0
                          rounded-[1.1rem]
                          bg-primary/[0.08]
                        "
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        transition={spring}
                        className="
                          absolute
                          left-1/2
                          top-0
                          h-1
                          w-8
                          -translate-x-1/2
                          rounded-b-full
                          bg-primary
                        "
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={spring}
                    className="relative z-10"
                  >
                    <Icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {isActive && (
                      <motion.span
                        initial={{
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={spring}
                        className="
                          absolute
                          inset-0
                          -z-10
                          rounded-full
                          bg-primary/20
                          blur-md
                        "
                      />
                    )}
                  </motion.div>

                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0.8,
                      y: isActive ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`
                      relative
                      z-10
                      max-w-full
                      truncate
                      text-[10px]
                      leading-4
                      tracking-tight
                      ${
                        isActive
                          ? "font-bold"
                          : "font-medium"
                      }
                    `}
                  >
                    {item.name}
                  </motion.span>

                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={spring}
                        className="
                          absolute
                          bottom-0.5
                          h-1
                          w-1
                          rounded-full
                          bg-primary
                        "
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}