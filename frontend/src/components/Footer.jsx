import React from 'react';
import { Ticket, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Ticket className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-white">Event<span className="text-red-500">X</span></span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              The premium destination for booking exclusive events. Experience the unforgettable with zero hassle.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-red-500 transition-colors">Browse Events</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Organizer Dashboard</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">How it Works</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all"><Twitter size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all"><Instagram size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all"><Linkedin size={18}/></a>
            </div>
            <a href="mailto:support@eventx.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Mail size={16} /> support@eventx.com
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 EventX Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;