import { useEffect, useRef } from "react";
import QRCode from "qrcode";

// QR Code real (Fase 4): codifica o link oculto da equipe (#/equipe/{token}),
// resolvido a partir da URL atual, entao funciona em dev e no deploy sob o site.
export function QrMock({ token, size = 88 }: { token: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const url = new URL(`#/equipe/${token}`, window.location.href).href;
    void QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      color: { dark: "#0A0E14", light: "#ffffff" },
    });
  }, [token, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-[2px] bg-white"
      style={{ width: size, height: size }}
    />
  );
}
