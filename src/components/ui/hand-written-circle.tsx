"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface HandWrittenCircleProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function HandWrittenCircle({
    children,
    className = "",
    delay = 0,
}: HandWrittenCircleProps) {
    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0, transition: { duration: 0 } },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay, duration: 2.5, ease: "easeInOut" },
                opacity: { delay, duration: 0.5 },
            },
        },
    };

    return (
        <span className={`relative inline-block ${className}`}>
            <span className="relative z-10">{children}</span>
            <span className="absolute inset-0 z-0 pointer-events-none select-none">
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 1200 600"
                    preserveAspectRatio="none"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
                    className="absolute top-[-25%] left-[-20%] w-[140%] h-[150%] text-theme-color"
                    style={{ overflow: 'visible' }}
                >
                    <motion.path
                        d="M 950 90 
                           C 1250 300, 1050 480, 600 520
                           C 250 520, 150 480, 150 300
                           C 150 120, 350 80, 600 80
                           C 850 80, 950 180, 950 180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        vectorEffect="non-scaling-stroke"
                    />
                </motion.svg>
            </span>
        </span>
    );
}
