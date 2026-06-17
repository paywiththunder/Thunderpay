import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6 pb-32 text-center text-xs text-gray-500">
      <div className="flex items-center justify-center gap-4">
        <Link
          href="https://www.paywiththunder.com/legal.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors"
        >
          Privacy Policy
        </Link>
        <span>•</span>
        <Link
          href="https://www.paywiththunder.com/legal.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
