export function Footer() {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} FlexFit AI. All rights reserved.</p>
        <p className="mt-1">
          Powered by AI, designed for your fitness journey.
        </p>
      </div>
    </footer>
  );
}
