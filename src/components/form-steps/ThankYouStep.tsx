import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormData } from "../CarFinanceForm";
import { CheckCircle, Clock, Phone, Mail, FileText, ArrowRight } from "lucide-react";

interface ThankYouStepProps {
  formData: FormData;
}

const ThankYouStep = ({ formData }: ThankYouStepProps) => {
  const applicationRef = `CF${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="font-semibold text-lg">CarFinanced</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you {formData.firstName}, we've received your car finance application
            </p>
          </div>

          {/* Application Summary */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Application Summary</h2>
                <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
                  Ref: {applicationRef}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Vehicle Details</h3>
                  <p>{formData.vehicleType === "new" ? "New" : "Used"} {formData.make} {formData.model || "Car"}</p>
                  <p>Budget: {formData.priceRange}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Contact Details</h3>
                  <p>{formData.email}</p>
                  <p>{formData.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Initial Review</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your application within 2 hours during business hours.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Lender Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll match you with the best lenders based on your profile and requirements.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Finance Quotes</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive competitive finance quotes within 24 hours via email and phone.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Call Us</h3>
                    <p className="text-sm text-muted-foreground">0800 123 4567</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri 9am-6pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-sm text-muted-foreground">support@carfinanced.co.uk</p>
                    <p className="text-xs text-muted-foreground">24/7 support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Information */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Important Reminders</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep your phone accessible - lenders may call to verify details</li>
                    <li>• Check your email (including spam folder) for updates</li>
                    <li>• Have your driving licence and bank statements ready</li>
                    <li>• Your application is valid for 30 days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button 
              onClick={() => window.print()} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print Application
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2"
            >
              Start Another Application
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8 p-4 bg-success/5 rounded-lg border border-success/20">
            <p className="text-sm text-muted-foreground">
              🎉 <strong>Congratulations!</strong> You've taken the first step towards 
              getting your dream car. Our expert team is now working to find you the best finance deal.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThankYouStep;