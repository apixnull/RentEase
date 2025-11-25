import React from "react";
import { motion } from "framer-motion";
import { Home, Building2, Sparkles, MapPin } from "lucide-react";

interface PropertiesHeaderProps {
	title: string | React.ReactNode;
	description?: string | React.ReactNode;
	actions?: React.ReactNode;
	customIcon?: React.ReactNode;
	className?: string;
}

const PropertiesHeader = ({ title, description, actions, customIcon, className }: PropertiesHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`w-full ${className ?? ""}`}
        >
            <div className="relative overflow-hidden rounded-2xl">
                {/* Enhanced gradient border effect - Vibrant Emerald to Green to Teal */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-300/80 via-green-200/70 via-teal-200/70 to-cyan-200/60 opacity-95" />
                
                {/* Glass card with enhanced backdrop */}
                <div className="relative m-[1px] rounded-[15px] bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg">
                    {/* Enhanced animated decorative blobs with more depth */}
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-300/50 to-green-400/40 blur-3xl"
                        initial={{ opacity: 0.4, scale: 0.8, x: -20 }}
                        animate={{ opacity: 0.7, scale: 1.1, x: 0 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-tl from-teal-300/50 to-cyan-300/40 blur-3xl"
                        initial={{ opacity: 0.3, scale: 1, x: 20 }}
                        animate={{ opacity: 0.8, scale: 1.2, x: 0 }}
                        transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl"
                        initial={{ opacity: 0.2 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
                    />

                    {/* Enhanced accent lines with shimmer effect */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                    <motion.div
                        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />

                    {/* Content */}
                    <div className="px-4 sm:px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Enhanced primary icon with badge or custom icon */}
                                {customIcon ? (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="flex-shrink-0"
                                    >
                                        {customIcon}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="relative flex-shrink-0"
                                    >
                                        {/* Main icon container with gradient */}
                                        <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white grid place-items-center shadow-xl shadow-emerald-500/30">
                                            <Home className="h-6 w-6 relative z-10" />
                                            {/* Shine effect */}
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                                        </div>
                                        
                                        {/* Building2 badge overlay */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/40 border-2 border-white"
                                        >
                                            <Building2 className="h-2.5 w-2.5 text-white fill-white" />
                                        </motion.div>
                                        
                                        {/* Pulsing ring effect */}
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </motion.div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2.5 mb-1">
                                        {typeof title === 'string' ? (
                                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 bg-clip-text text-transparent truncate">
                                                {title}
                                            </h1>
                                        ) : (
                                            <div className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 bg-clip-text text-transparent">
                                                {title}
                                            </div>
                                        )}
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Sparkles className="h-5 w-5 text-emerald-500" />
                                        </motion.div>
                                    </div>
                                    {description ? (
                                        typeof description === 'string' ? (
                                            <p className="text-sm text-gray-600 leading-6 truncate flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                                {description}
                                            </p>
                                        ) : (
                                            <div className="text-sm text-gray-600 leading-6 flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                                {description}
                                            </div>
                                        )
                                    ) : null}
                                </div>
                            </div>

                            {actions ? (
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    {actions}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2.5 text-emerald-500/80">
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Home className="h-4 w-4" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [0, 3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    >
                                        <Building2 className="h-4 w-4 fill-emerald-500/50" />
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced animated underline with gradient shimmer */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            style={{ originX: 0 }}
                            className="mt-4 relative h-1 w-full rounded-full overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/80 via-green-400/80 via-teal-400/80 to-cyan-400/80 rounded-full" />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertiesHeader;

