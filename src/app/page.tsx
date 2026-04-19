export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">ormlab</h1>
        <p className="text-xl text-gray-600 mb-2">
          Free tools for modern TypeScript ORMs
        </p>
        <p className="text-sm text-gray-500">
          Drizzle, Prisma, and more — launching soon
        </p>
      </div>
    </main>
  );
}