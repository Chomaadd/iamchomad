export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-background py-12 md:py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <h2 className="font-serif text-2xl font-bold tracking-tighter">Choiril Ahmad</h2>
          <p className="text-muted-foreground mt-2 text-sm">Crafting digital experiences with precision.</p>
        </div>
        <div className="flex space-x-6 text-sm font-medium text-muted-foreground">
          <a href="https://twitter.com/iamchomad" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#https://facebook.com/iamchomad" className="hover:text-primary transition-colors">Facebook</a>
          <a href="#https://instagram.com/iamchomad" className="hover:text-primary transition-colors">Instagram</a>
        </div>
      </div>
      <div className="max-w-7xl auto px-6 lg:px-8 mt-12 text-center md:text-left text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Choiril Ahmad. All rights reserved.
      </div>
    </footer>
  );
}
