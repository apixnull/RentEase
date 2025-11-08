import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Stars, Waves } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

const AdminPageHeader = ({ title, description, icon: Icon, actions, className }: AdminPageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`w-full ${className ?? ""}`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {/* Gradient border effect - Admin purple/blue */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-300/70 via-blue-200/50 to-purple-300/70 opacity-90" />
        {/* Glass card */}
        <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50">
          {/* Animated decorative blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-purple-300/40 blur-3xl"
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-blue-300/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0.75, scale: 1.1 }}
            transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror" }}
          />

          {/* Subtle accent lines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

          {/* Content */}
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Primary icon */}
                {Icon ? (
                  <motion.div
                    whileHover={{ scale: 1.03, rotate: 0.4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white grid place-items-center shadow-md"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.03, rotate: 0.4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white grid place-items-center shadow-md"
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </motion.div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                      {title}
                    </h1>
                    <Stars className="h-4 w-4 text-purple-500" />
                  </div>
                  {description ? (
                    <p className="text-sm text-gray-600 leading-5 truncate">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              {actions ? (
                <div className="flex-shrink-0 flex items-center gap-2">
                  {actions}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 text-blue-500/80">
                  <Waves className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Animated underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              style={{ originX: 0 }}
              className="mt-3 h-0.5 w-full bg-gradient-to-r from-purple-400/70 via-blue-400/70 to-purple-400/70 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPageHeader;


