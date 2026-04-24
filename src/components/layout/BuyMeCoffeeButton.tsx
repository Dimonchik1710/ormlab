import Link from "next/link";

export default function BuyMeCoffeeButton() {
  return (
    <Link
      href="https://buymeacoffee.com/ormlab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      title="Buy me a coffee"
      className="group fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50"
    >
      <span
        aria-hidden="true"
        className="bmc-ring absolute inset-0 rounded-full bg-[#FFDD00]"
      />
      <span
        className="bmc-float relative flex items-center justify-center w-12 h-12 rounded-full bg-[#FFDD00] text-gray-900 shadow-lg ring-1 ring-black/10 hover:bg-[#FFE54A] transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="w-6 h-6 overflow-visible"
          fill="none"
        >
          {/* steam */}
          <g className="bmc-steam" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            <path d="M9 3.5c0 1-1 1-1 2s1 1 1 2" />
            <path d="M12 2.5c0 1-1 1-1 2s1 1 1 2" />
            <path d="M15 3.5c0 1-1 1-1 2s1 1 1 2" />
          </g>
          {/* cup body */}
          <path
            d="M5 9h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* handle */}
          <path
            d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* saucer */}
          <path
            d="M4 20h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </Link>
  );
}
