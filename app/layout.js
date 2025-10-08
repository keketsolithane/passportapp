export const metadata = {
  title: "Passport Services",
  description: "Apply, renew, and track passport status.",
};

import "./globals.css";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <ErrorBoundary>
          <Header />
          <NavBar />
          <main className="flex-1 container mx-auto py-8 px-4">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}