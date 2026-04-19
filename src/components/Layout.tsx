import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-xl font-bold tracking-tighter">
            CORELENS<span className="text-accent">.</span>
          </div>
          <div className="flex space-x-8 text-sm opacity-60 uppercase tracking-widest font-medium">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
          <p className="text-xs opacity-40 uppercase tracking-widest">
            © 2026 CoreLens Threads. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
