"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { 
  Chrome, 
  Mail, 
  Lock, 
  Loader2,
  ArrowRight,
  Shield,
  User
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("credentials", { 
      email, 
      password, 
      redirect: true, 
      callbackUrl: "/" 
    })
    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/" })
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-50 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Bienvenido de nuevo</h1>
            <p className="text-gray-600 text-sm">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="group relative w-full inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-gray-300 hover:border-red-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white text-gray-700 hover:bg-gray-50 h-12 px-6 py-3"
          >
            <div className="absolute left-4">
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <span className="font-semibold">
              {googleLoading ? "Conectando..." : "Continuar con Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
              O continúa con email
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="email">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="peer w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-12 text-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-400 placeholder:text-gray-400"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="password">
                  <Lock className="w-4 h-4" />
                  Contraseña
                </label>
                <a 
                  href="#" 
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="peer w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-12 text-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-400 placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Recordarme en este dispositivo
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] h-12 px-6 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Tus datos están protegidos</span>
            </div>
            <p className="text-center text-xs text-gray-500">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}