import { AppProps } from 'next/app';
import '../styles/globals.css'; // Import global styles

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-[852px] mx-auto px-8 py-8">
          <Component {...pageProps} />
        </div>
      </main>
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-[852px] mx-auto px-4 text-center">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Project Links
          </h3>
          <div className="flex justify-center space-x-8">
            <a
              href="https://github.com/knightsri/Relinkr/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              README
            </a>
            <a
              href="https://github.com/knightsri/Relinkr/blob/main/DESIGN.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Design Docs
            </a>
            <a
              href="https://github.com/knightsri/Relinkr/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MyApp;
