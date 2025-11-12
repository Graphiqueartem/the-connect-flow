import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormData } from "../CarFinanceForm";
import { Shield, FileText, Users, CreditCard } from "lucide-react";

interface ConsentStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const ConsentStep = ({ formData, updateFormData, errors }: ConsentStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Consent & Privacy</h3>
        <p className="text-muted-foreground">
          Please review and agree to our terms to complete your application
        </p>
      </div>

      {/* GDPR Consent Checkboxes */}
      <div className="space-y-6">
        {/* Privacy Policy Consent */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacyConsent"
              checked={formData.privacyConsent}
              onCheckedChange={(checked) => 
                updateFormData({ privacyConsent: checked as boolean })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="privacyConsent" className="text-base font-medium cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Policy Agreement *
                </div>
              </Label>
              <p className="text-sm text-muted-foreground mb-3 text-center">
                I agree to the processing of my personal data in accordance with the{" "}
                <a href="https://carfinanced.co.uk/privacy?_gl=1*1cbkk17*_ga*MTIwNDU0ODg5Ni4xNzU3Njc4ODIx*_ga_6ZQ951WRXK*czE3NTc3MDAzMzckbzMkZzEkdDE3NTc3MDQ4NjgkajU4JGwwJGgw" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                . I understand my data will be shared with FCA-regulated lenders to provide 
                finance quotes and may be used for fraud prevention.
              </p>
              {errors.privacyConsent && (
                <p className="text-destructive text-sm">{errors.privacyConsent}</p>
              )}
            </div>
          </div>
        </div>

        {/* Credit Check Consent */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="creditCheckConsent"
              checked={formData.creditCheckConsent}
              onCheckedChange={(checked) => 
                updateFormData({ creditCheckConsent: checked as boolean })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="creditCheckConsent" className="text-base font-medium cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Credit Check Authorization *
                </div>
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                I consent to credit checks being performed by lenders to assess my application. 
                Initial checks may be "soft searches" that don't affect my credit score, 
                followed by "hard searches" only with my explicit consent before finalizing any agreement.
              </p>
              {errors.creditCheckConsent && (
                <p className="text-destructive text-sm">{errors.creditCheckConsent}</p>
              )}
            </div>
          </div>
        </div>

        {/* Marketing Consent (Optional) */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketingConsent"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => 
                updateFormData({ marketingConsent: checked as boolean })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="marketingConsent" className="text-base font-medium cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Marketing Communications (Optional)
                </div>
              </Label>
              <p className="text-sm text-muted-foreground">
                I would like to receive updates about new finance products, special offers, 
                and helpful tips via email and SMS. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-2">Your Rights</h4>
              <p className="text-sm text-muted-foreground">
                You have the right to access, update, or delete your personal data. 
                Contact our Data Protection Officer for any privacy-related queries.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-success/5 p-4 rounded-lg border border-success/20">
          <div className="flex flex-col items-center text-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <div>
              <h4 className="font-medium text-success mb-2">Data Security</h4>
              <p className="text-sm text-muted-foreground">
                All data is encrypted using industry-standard security measures. 
                We're registered with the ICO and fully GDPR compliant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Information */}
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">Important Information</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• You must be 18+ and a UK resident to apply</li>
          <li>• Credit is subject to status and affordability checks</li>
          <li>• We are a credit broker, not a lender</li>
          <li>• We may receive commission from lenders</li>
        </ul>
      </div>

      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground">
          🔒 <strong>Secure Application:</strong> This application is protected by 256-bit SSL encryption. 
          Your data is safe and will only be shared with trusted, FCA-regulated partners.
        </p>
      </div>
    </div>
  );
};

export default ConsentStep;