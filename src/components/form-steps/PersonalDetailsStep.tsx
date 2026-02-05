import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "../CarFinanceForm";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface PersonalDetailsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const titles = [
  "Mr", "Mrs", "Miss", "Ms", "Dr", "Professor", "Rev"
];

const PersonalDetailsStep = ({ formData, updateFormData, errors }: PersonalDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Personal Details</h3>
        <p className="text-muted-foreground">
          We need these details to process your application
        </p>
      </div>

      {/* Title and Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Title *</Label>
          <Select
            value={formData.title}
            onValueChange={(value) => updateFormData({ title: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Title" />
            </SelectTrigger>
            <SelectContent>
              {titles.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-base font-medium">
            First Name *
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            className="h-12"
          />
          {errors.firstName && (
            <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-base font-medium">
            Last Name *
          </Label>
          <Input
            id="lastName"
            placeholder="Smith"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            className="h-12"
          />
          {errors.lastName && (
            <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date of Birth *
        </Label>
        <div className="relative">
          <Input
            placeholder="26 / 04 / 2001"
            value={formData.dateOfBirth}
            onChange={(e) => {
              // Format the input as DD / MM / YYYY
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.slice(0, 2) + ' / ' + value.slice(2);
              }
              if (value.length >= 7) {
                value = value.slice(0, 7) + ' / ' + value.slice(7, 11);
              }
              updateFormData({ dateOfBirth: value });
            }}
            className="h-12 text-lg"
            maxLength={14}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>
        )}
        <p className="text-xs text-muted-foreground">
          You must be 18+ to apply for vehicle finance
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.smith@example.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="h-12"
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="07123 456789"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="h-12"
          />
          {errors.phone && (
            <p className="text-destructive text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-primary mb-2">Personal Information</h4>
            <p className="text-sm text-muted-foreground">
              This information must match your official documents (driving licence, passport, etc.) 
              as lenders will verify your identity as part of the application process.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          🔒 <strong>Privacy:</strong> We'll only use your contact details to update you 
          about your application and any suitable finance offers.
        </p>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;