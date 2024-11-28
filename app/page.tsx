// app/page.tsx
import IoTInterface from "./Components/IoTInterface";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="w-full flex justify-between items-center">
          <code className="bg-black/[.05] dark:bg-white/[.06] px-3 py-1 rounded font-semibold">
            IoT Wizard
          </code>
        </div>

        <IoTInterface />

    
      </main>

      
    </div>
  );
}