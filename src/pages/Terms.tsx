
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 prose max-w-none">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using Kigali Ride, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use Kigali Ride for personal, non-commercial 
              transactional use only. This is the grant of a license, not a transfer of title.
            </p>

            <h2>User Responsibilities</h2>
            <p>As a user of our platform, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Treat other users with respect and courtesy</li>
              <li>Not engage in fraudulent or harmful activities</li>
            </ul>

            <h2>Driver Requirements</h2>
            <p>Drivers must:</p>
            <ul>
              <li>Hold a valid driver's license</li>
              <li>Maintain appropriate vehicle insurance</li>
              <li>Keep their vehicle in safe operating condition</li>
              <li>Comply with all traffic laws and regulations</li>
              <li>Treat passengers with respect and professionalism</li>
            </ul>

            <h2>Payment Terms</h2>
            <p>
              Payment for rides is handled directly between passengers and drivers. Kigali Ride 
              facilitates the connection but does not process payments directly.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Kigali Ride shall not be liable for any damages arising from the use of this service, 
              including but not limited to direct, indirect, incidental, punitive, and consequential damages.
            </p>

            <h2>Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the service.
            </p>

            <h2>Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via the platform or email.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions regarding these Terms of Service, please contact us at 
              legal@kigaliride.com
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Terms;
