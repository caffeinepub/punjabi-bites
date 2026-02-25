export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'punjabi-bites');

  return (
    <footer className="bg-deepRed/95 text-cream/80 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-display text-saffron font-bold text-lg">PUNJABI BITES</p>
            <p className="text-sm text-cream/60 mt-1">Authentic Punjabi Cuisine</p>
          </div>
          <div className="text-center text-sm text-cream/60">
            <p>© {year} PUNJABI BITES. All rights reserved.</p>
            <p className="mt-1">
              Built with{' '}
              <span className="text-saffron">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron hover:text-saffron/80 transition-colors font-medium"
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
