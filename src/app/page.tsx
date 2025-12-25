import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <main className="flex flex-col items-center text-center p-8 z-10 max-w-4xl">
        <div className="mb-8 p-4 rounded-full bg-secondary/30 border border-primary/20 backdrop-blur-md shadow-2xl animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
            />
          </svg>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Secure Access Portal
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Restricted access environment. Please use your verified token link to proceed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="px-8 py-4 rounded-xl bg-secondary/50 border border-primary/20 backdrop-blur-sm text-primary font-semibold flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            System Operational
          </div>

          <Link
            href="/admin"
            className="px-8 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium backdrop-blur-sm"
          >
            Admin Access
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Technova Secure Systems. All rights reserved.
      </footer>
    </div>
  );
}
