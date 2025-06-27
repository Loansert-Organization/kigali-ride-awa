
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Target, 
  Heart, 
  Award,
  MapPin,
  Calendar
} from 'lucide-react';

const About = () => {
  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Rides Completed", value: "50,000+", icon: Target },
    { label: "Cities Served", value: "3", icon: MapPin },
    { label: "Years of Service", value: "2+", icon: Calendar }
  ];

  const values = [
    {
      title: "Safety First",
      description: "We prioritize the safety and security of all our users through verified drivers and secure ride matching.",
      icon: Heart
    },
    {
      title: "Community Driven",
      description: "Built for the Rwandan community, understanding local needs and providing culturally relevant solutions.",
      icon: Users
    },
    {
      title: "Innovation",
      description: "Leveraging cutting-edge technology to provide the best ride-sharing experience in East Africa.",
      icon: Award
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Kigali Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing transportation in Rwanda by connecting passengers and drivers 
            through a safe, reliable, and community-focused ride-sharing platform.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              To provide safe, affordable, and reliable transportation solutions that connect 
              communities across Rwanda. We believe in empowering local drivers while offering 
              passengers convenient access to rides through innovative technology that respects 
              local culture and needs.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Kigali Ride was founded in 2022 with a simple vision: to make transportation 
                more accessible and reliable for everyone in Rwanda. Starting in Kigali, we 
                recognized the need for a locally-built solution that understands the unique 
                transportation challenges and opportunities in our beautiful country.
              </p>
              <p className="text-gray-600 mb-4">
                Our team combines international technology expertise with deep local knowledge, 
                ensuring that every feature we build serves the real needs of Rwandan passengers 
                and drivers. From supporting multiple languages including Kinyarwanda to 
                integrating with local payment methods, we're committed to being truly local.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve thousands of users across multiple cities, 
                facilitating safe and reliable transportation while supporting local drivers 
                in building sustainable livelihoods.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            Whether you're looking for a ride or want to earn as a driver, 
            we'd love to have you as part of the Kigali Ride family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Book Your First Ride</Button>
            <Button variant="outline" size="lg">Become a Driver</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
