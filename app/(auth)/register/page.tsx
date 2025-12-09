import { registerUser } from "@/app/actions/users"

export default function RegisterPage() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Crear cuenta</h1>
      <form action={registerUser} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 h-9 px-4 py-2 w-full">
          Registrarme
        </button>
      </form>
    </div>
  )
}
