
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Book, 
  Phone,
  Mail,
  Clock
} from 'lucide-react';

const Help = () => {
  const faqItems = [
    {
      question: "How do I book a ride?",
      answer: "Navigate to the 'Book Ride' section, enter your pickup and destination locations, select your preferred vehicle type, and confirm your booking."
    },
    {
      question: "How do I become a driver?",
      answer: "Sign up as a driver, complete the vehicle setup process, and start creating trips or accepting passenger requests."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Currently, we support cash payments and mobile money (MoMo). Digital payment integration is coming soon."
    },
    {
      question: "How does the rewards system work?",
      answer: "Earn points by referring new users and completing rides. Check the Rewards section for your current points and leaderboard position."
    }
  ];

  const contactOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      available: "24/7"
    },
    {
      title: "Phone Support",
      description: "Call us for urgent assistance",
      icon: Phone,
      action: "+250 788 123 456",
      available: "Mon-Fri 8AM-6PM"
    },
    {
      title: "Email Support",
      description: "Send us your questions via email",
      icon: Mail,
      action: "support@kigaliride.com",
      available: "Response within 24hrs"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <Button variant="outline" className="w-full mb-2">
                    {option.action}
                  </Button>
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {option.available}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "User Guide", icon: Book },
            { label: "Safety Tips", icon: HelpCircle },
            { label: "Terms of Service", icon: Book },
            { label: "Privacy Policy", icon: Book }
          ].map((link, index) => {
            const Icon = link.icon;
            return (
              <Button key={index} variant="ghost" className="h-auto p-4 flex flex-col">
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm">{link.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Help;
