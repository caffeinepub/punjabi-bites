export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'punjabi-bites');

  return (
    <footer className="bg-deepRed-800 text-cream-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-saffron-400">PUNJABI BITES</p>
            <p className="text-sm text-cream-300 mt-1">Authentic Punjabi Cuisine</p>
          </div>
          <div className="text-center text-sm text-cream-400">
            <p>© {year} Punjabi Bites. All rights reserved.</p>
            <p className="mt-1">
              Built with{' '}
              <span className="text-saffron-400">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-400 hover:text-saffron-300 underline transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
