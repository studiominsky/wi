export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Word Inventory. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
