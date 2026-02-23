import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightRevealProps {
    className?: string; // Wrapper classes
    frontImage: string;
    backImage: string;
    alt: string;
    frontImageClassName?: string;
    backImageClassName?: string;
    revealRadius?: number; // approx radius
}

export const SpotlightReveal: React.FC<SpotlightRevealProps> = ({
    className,
    frontImage,
    backImage,
    alt,
    frontImageClassName,
    backImageClassName,
    revealRadius = 200,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frontImgRef = useRef<HTMLImageElement | null>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const isAnimating = useRef(false);
    const lastMoveTime = useRef(0);
    const mousePosRef = useRef<{ x: number; y: number } | null>(null);
    const isHoveringRef = useRef(false);

    // Healing speed: how fast the front image restores after reveal
    const fadeSpeed = 0.035;
    // Time in ms to wait after last movement before snapping to full quality
    const IDLE_THRESHOLD = 800;

    const drawImageOnCanvas = useCallback((alpha: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = frontImgRef.current;

        // We cannot proceed without these
        if (!canvas || !ctx || !img) return;

        // Also need container for dimensions, but usually current canvas size is good enough? 
        // Ideally we match container.
        const container = containerRef.current;
        const w = container ? container.clientWidth : canvas.width;
        const h = container ? container.clientHeight : canvas.height;

        // Logic to replicate 'object-fit: cover'
        const imgRatio = img.width / img.height;
        const containerRatio = w / h;

        let renderW, renderH, offsetX, offsetY;

        if (containerRatio > imgRatio) {
            renderW = w;
            renderH = w / imgRatio;
            offsetX = 0;
            offsetY = (h - renderH) / 2;
        } else {
            renderH = h;
            renderW = h * imgRatio;
            offsetX = (w - renderW) / 2;
            offsetY = 0;
        }

        ctx.globalCompositeOperation = "source-over";

        // Ensure we fill the background again if we are redrawing or healing
        // BUT wait, if we are HEALING (alpha < 1), we are layering on top.
        // If we fill with opaque black at alpha 0.04, it will darken everything slowly.
        // The healing logic "adds" the original image back. 
        // If the original image has transparency, adding it back just adds more transparent px? No.

        // Actually, the healing logic is tricky with transparency.
        // If we want to restore the "Cover", we need to restore the [Black Background + Image].
        // So we should draw the black bg at 'alpha' then the image at 'alpha'?
        // No, that will mix weirdly.

        // Simplified approach for now:
        // If alpha is 1 (reset), clear and fill opaque.
        // If alpha is small (healing), just draw the image? No, that won't recover the black bg part.

        if (alpha === 1) {
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#0A0A0A";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        } else {
            // Healing logic: We want to slowly fill the holes.
            // Drawing the image repeatedly with low alpha will eventually fill the opacity BUT 
            // it won't fill the "Background Color" part if the image is transparent there.
            // So we need to draw the BACKGROUND COLOR with low alpha too.

            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#0A0A0A";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Then draw image on top? 
            // If we draw black (0.04) then image (0.04), we are building up both.
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
            ctx.globalAlpha = 1.0;
        }
    }, []); // Dependencies empty as refs are stable

    const punchRevealHole = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.globalCompositeOperation = "destination-out";
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, revealRadius);
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(0.5, "rgba(0,0,0,1)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, revealRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    }, [revealRadius]);

    const startAnimationLoop = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const loop = () => {
            const now = Date.now();
            const timeSinceLastMove = now - lastMoveTime.current;

            if (!isHoveringRef.current && timeSinceLastMove > IDLE_THRESHOLD) {
                // Idle and mouse left: Snap to perfect quality
                drawImageOnCanvas(1);
                isAnimating.current = false;
                requestRef.current = undefined;
                return;
            }

            // Healing: restore front image gradually
            drawImageOnCanvas(fadeSpeed);

            // Re-punch the reveal hole at current mouse position
            if (isHoveringRef.current && mousePosRef.current) {
                punchRevealHole(mousePosRef.current.x, mousePosRef.current.y);
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        loop();
    }, [drawImageOnCanvas, fadeSpeed, punchRevealHole]); // Stable dependencies

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !frontImgRef.current) return;

        // Set Resolution
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        // Initial Draw
        // We must fill with a solid color first if the front image has transparency, 
        // otherwise the back image shows through immediately.
        // Using a dark color that matches the typical card/section background.
        // Since we don't know the exact parent bg, we'll use a standard dark hex or pass via props.
        // For now, let's assume a dark surface color #0D0D0D or similar, or make it configurable.
        // Actually, if we want it to look like a "Card", we can just clearRect (transparent) 
        // BUT if it is transparent, the back shows.
        // So we MUST fill it. Let's use a prop or default to #0a0a0a (near black).

        // Better: Draw the image, and IF it is transparent, the back shows. 
        // The issue described is that the back shows through the TRANSPARENT parts of the front.
        // So we need to put a "curtain" color behind the front image.

        if (ctx) {
            ctx.fillStyle = "#0A0A0A"; // Matching typical section bg
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawImageOnCanvas(1);
    }, [drawImageOnCanvas]);

    // Load Image
    useEffect(() => {
        const img = new Image();
        img.src = frontImage;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            frontImgRef.current = img;
            initCanvas();
        };
        return () => {
            if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
            isAnimating.current = false;
        };
    }, [frontImage, initCanvas]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            initCanvas();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [initCanvas]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        lastMoveTime.current = Date.now();

        if (!isAnimating.current) {
            startAnimationLoop();
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            const touch = e.touches[0];
            if (!touch) return;
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        mousePosRef.current = { x, y };
        isHoveringRef.current = true;

        punchRevealHole(x, y);
    };

    const handleMouseLeave = () => {
        isHoveringRef.current = false;
        mousePosRef.current = null;
        lastMoveTime.current = Date.now();
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-hidden rounded-2xl select-none group touch-none cursor-default",
                className
            )}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Invisible image to provide natural aspect ratio and dimensions */}
            <img
                src={frontImage}
                alt={alt}
                className="w-full h-auto block opacity-0 pointer-events-none"
                aria-hidden="true"
            />

            <img
                src={backImage}
                alt={`${alt} (Revealed)`}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none",
                    backImageClassName
                )}
            />

            <canvas
                ref={canvasRef}
                className={cn(
                    "absolute inset-0 z-10 block w-full h-full touch-none",
                    frontImageClassName
                )}
            />

            <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-2xl z-20" />
        </div>
    );
};

export default SpotlightReveal;
