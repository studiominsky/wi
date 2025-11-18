export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#fbfbfb] dark:bg-[#000]">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Word Inventory by{" "}
          <a href="https://studiominsky.com" target="_blank">
            Studio Minsky
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
