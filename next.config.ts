// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Desactiva el soporte de optimización de imágenes para todos los dominios
        // Esta es la forma más abierta, pero MENOS segura.
        // Se recomienda solo si no hay otra alternativa.
        remotePatterns: [
            {
                protocol: "https",
                // El comodín '**' permite cualquier subdominio y cualquier dominio.
                hostname: "**", 
            },
        ],
    },
};

export default nextConfig;