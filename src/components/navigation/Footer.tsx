
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    company: [
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Help & Support', path: '/help' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
    ],
    social: [
      { icon: Facebook, href: '#', label: 'Facebook' },
      { icon: Twitter, href: '#', label: 'Twitter' },
      { icon: Instagram, href: '#', label: 'Instagram' },
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KR</span>
              </div>
              <span className="text-xl font-bold">Kigali Ride</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your reliable ride-sharing companion in Kigali. Connecting passengers and drivers 
              for safe, convenient, and affordable transportation across the city.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+250 788 123 456</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@kigaliride.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                    onClick={() => navigate(link.path)}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                    onClick={() => navigate(link.path)}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Kigali Ride. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {footerLinks.social.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(social.href, '_blank')}
                >
                  <Icon className="w-4 h-4" />
                  <span className="sr-only">{social.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
