import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData, Address } from "../CarFinanceForm";
import { Home, MapPin, Plus, Trash2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface AddressHistoryStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const AddressHistoryStep = ({ formData, updateFormData, errors }: AddressHistoryStepProps) => {
  // Calculate total address duration in months
  const calculateTotalDuration = (): number => {
    const currentYears = parseInt(formData.currentAddress.yearsAtAddress || "0");
    const currentMonths = parseInt(formData.currentAddress.monthsAtAddress || "0");
    const currentTotal = (currentYears * 12) + currentMonths;
    
    const previousTotal = formData.previousAddresses.reduce((total, address) => {
      const years = parseInt(address.yearsAtAddress || "0");
      const months = parseInt(address.monthsAtAddress || "0");
      return total + (years * 12) + months;
    }, 0);
    
    return currentTotal + previousTotal;
  };

  const totalDuration = calculateTotalDuration();
  const needsMoreHistory = totalDuration < 36;
  const remainingMonths = Math.max(0, 36 - totalDuration);

  const addPreviousAddress = () => {
    const newAddress: Address = {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
      yearsAtAddress: "",
      monthsAtAddress: "",
      ownershipType: ""
    };
    updateFormData({
      previousAddresses: [...formData.previousAddresses, newAddress]
    });
  };

  const updatePreviousAddress = (index: number, updates: Partial<Address>) => {
    const updatedAddresses = [...formData.previousAddresses];
    updatedAddresses[index] = { ...updatedAddresses[index], ...updates };
    updateFormData({ previousAddresses: updatedAddresses });
  };

  const removePreviousAddress = (index: number) => {
    const updatedAddresses = formData.previousAddresses.filter((_, i) => i !== index);
    updateFormData({ previousAddresses: updatedAddresses });
  };

  const ownershipOptions = [
    { value: "owner", label: "Owner" },
    { value: "tenant", label: "Tenant" },
    { value: "living_with_family", label: "Living with family" },
    { value: "living_with_friends", label: "Living with friends" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Address History</h3>
        <p className="text-muted-foreground">
          Lenders need your address history for the last 3 years (36 months)
        </p>
        
        {/* Progress indicator */}
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">
              Address History Progress: {totalDuration} / 36 months
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (totalDuration / 36) * 100)}%` }}
            ></div>
          </div>
          {remainingMonths > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Need {remainingMonths} more months of address history
            </p>
          )}
        </div>
      </div>

      {/* Current Address */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-medium">Current Address</h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentLine1" className="text-base font-medium">
              Search Address *
            </Label>
            <AddressAutocomplete
              value={formData.currentAddress.line1}
              onChange={(value, details) => {
                if (details) {
                  updateFormData({
                    currentAddress: {
                      ...formData.currentAddress,
                      line1: details.line1 || value,
                      line2: details.line2 || formData.currentAddress.line2,
                      city: details.city || formData.currentAddress.city,
                      postcode: details.postcode || formData.currentAddress.postcode
                    }
                  });
                } else {
                  updateFormData({
                    currentAddress: { ...formData.currentAddress, line1: value }
                  });
                }
              }}
              placeholder="Start typing your address..."
              className="h-12 w-full border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors["currentAddress.line1"] && (
              <p className="text-destructive text-sm mt-1">{errors["currentAddress.line1"]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentLine1Manual" className="text-base font-medium">
              Address Line 1 *
            </Label>
            <Input
              id="currentLine1Manual"
              placeholder="123 Main Street"
              value={formData.currentAddress.line1}
              onChange={(e) => updateFormData({
                currentAddress: { ...formData.currentAddress, line1: e.target.value }
              })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLine2" className="text-base font-medium">
              Address Line 2
            </Label>
            <Input
              id="currentLine2"
              placeholder="Apartment, suite, etc."
              value={formData.currentAddress.line2}
              onChange={(e) => updateFormData({
                currentAddress: { ...formData.currentAddress, line2: e.target.value }
              })}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentCity" className="text-base font-medium">
              City *
            </Label>
            <Input
              id="currentCity"
              placeholder="London"
              value={formData.currentAddress.city}
              onChange={(e) => updateFormData({
                currentAddress: { ...formData.currentAddress, city: e.target.value }
              })}
              className="h-12"
            />
            {errors["currentAddress.city"] && (
              <p className="text-destructive text-sm mt-1">{errors["currentAddress.city"]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPostcode" className="text-base font-medium">
              Postcode *
            </Label>
            <Input
              id="currentPostcode"
              placeholder="SW1A 1AA"
              value={formData.currentAddress.postcode}
              onChange={(e) => updateFormData({
                currentAddress: { ...formData.currentAddress, postcode: e.target.value.toUpperCase() }
              })}
              className="h-12"
            />
            {errors["currentAddress.postcode"] && (
              <p className="text-destructive text-sm mt-1">{errors["currentAddress.postcode"]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">
            How long have you lived at this address? *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Fill in at least one field (years or months)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-primary">Years</Label>
              <Input
                placeholder="0"
                value={formData.currentAddress.yearsAtAddress}
                onChange={(e) => {
                  updateFormData({
                    currentAddress: {
                      ...formData.currentAddress,
                      yearsAtAddress: e.target.value
                    }
                  });
                }}
                className="h-12"
                type="number"
                min="0"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-primary">Months</Label>
              <Input
                placeholder="0"
                value={formData.currentAddress.monthsAtAddress || ""}
                onChange={(e) => updateFormData({
                  currentAddress: {
                    ...formData.currentAddress,
                    monthsAtAddress: e.target.value
                  }
                })}
                className="h-12"
                type="number"
                min="0"
                max="11"
              />
            </div>
          </div>
          {errors["currentAddress.yearsAtAddress"] && (
            <p className="text-destructive text-sm mt-1">{errors["currentAddress.yearsAtAddress"]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentOwnership" className="text-base font-medium">
            Ownership Type *
          </Label>
          <Select
            value={formData.currentAddress.ownershipType}
            onValueChange={(value) => updateFormData({
              currentAddress: { ...formData.currentAddress, ownershipType: value }
            })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select ownership type" />
            </SelectTrigger>
            <SelectContent>
              {ownershipOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["currentAddress.ownershipType"] && (
            <p className="text-destructive text-sm mt-1">{errors["currentAddress.ownershipType"]}</p>
          )}
        </div>
      </div>

      {/* Previous Addresses */}
      {formData.previousAddresses.map((address, index) => (
        <div key={index} className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-medium">Previous Address {index + 1}</h4>
            </div>
            {formData.previousAddresses.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePreviousAddress(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor={`previousLine1-${index}`} className="text-base font-medium">
                Search Address *
              </Label>
              <AddressAutocomplete
                value={address.line1}
                onChange={(value, details) => {
                  if (details) {
                    updatePreviousAddress(index, {
                      line1: details.line1 || value,
                      line2: details.line2 || address.line2,
                      city: details.city || address.city,
                      postcode: details.postcode || address.postcode
                    });
                  } else {
                    updatePreviousAddress(index, { line1: value });
                  }
                }}
                placeholder="Start typing your address..."
                className="h-12 w-full border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors[`previousAddress.${index}.line1`] && (
                <p className="text-destructive text-sm mt-1">{errors[`previousAddress.${index}.line1`]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`previousLine1Manual-${index}`} className="text-base font-medium">
                Address Line 1 *
              </Label>
              <Input
                id={`previousLine1Manual-${index}`}
                placeholder="456 Previous Street"
                value={address.line1}
                onChange={(e) => updatePreviousAddress(index, { line1: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`previousLine2-${index}`} className="text-base font-medium">
                Address Line 2
              </Label>
              <Input
                id={`previousLine2-${index}`}
                placeholder="Apartment, suite, etc."
                value={address.line2}
                onChange={(e) => updatePreviousAddress(index, { line2: e.target.value })}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`previousCity-${index}`} className="text-base font-medium">
                City *
              </Label>
              <Input
                id={`previousCity-${index}`}
                placeholder="Manchester"
                value={address.city}
                onChange={(e) => updatePreviousAddress(index, { city: e.target.value })}
                className="h-12"
              />
              {errors[`previousAddress.${index}.city`] && (
                <p className="text-destructive text-sm mt-1">{errors[`previousAddress.${index}.city`]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`previousPostcode-${index}`} className="text-base font-medium">
                Postcode *
              </Label>
              <Input
                id={`previousPostcode-${index}`}
                placeholder="M1 1AA"
                value={address.postcode}
                onChange={(e) => updatePreviousAddress(index, { postcode: e.target.value.toUpperCase() })}
                className="h-12"
              />
              {errors[`previousAddress.${index}.postcode`] && (
                <p className="text-destructive text-sm mt-1">{errors[`previousAddress.${index}.postcode`]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">
              How long did you live at this address? *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Fill in at least one field (years or months)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">Years</Label>
                <Input
                  placeholder="0"
                  value={address.yearsAtAddress}
                  onChange={(e) => updatePreviousAddress(index, { yearsAtAddress: e.target.value })}
                  className="h-12"
                  type="number"
                  min="0"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">Months</Label>
                <Input
                  placeholder="0"
                  value={address.monthsAtAddress}
                  onChange={(e) => updatePreviousAddress(index, { monthsAtAddress: e.target.value })}
                  className="h-12"
                  type="number"
                  min="0"
                  max="11"
                />
              </div>
            </div>
            {errors[`previousAddress.${index}.yearsAtAddress`] && (
              <p className="text-destructive text-sm mt-1">{errors[`previousAddress.${index}.yearsAtAddress`]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`previousOwnership-${index}`} className="text-base font-medium">
              Ownership Type *
            </Label>
            <Select
              value={address.ownershipType}
              onValueChange={(value) => updatePreviousAddress(index, { ownershipType: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select ownership type" />
              </SelectTrigger>
              <SelectContent>
                {ownershipOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[`previousAddress.${index}.ownershipType`] && (
              <p className="text-destructive text-sm mt-1">{errors[`previousAddress.${index}.ownershipType`]}</p>
            )}
          </div>
        </div>
      ))}

      {/* Add Previous Address Button */}
      {needsMoreHistory && (
        <div className="border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={addPreviousAddress}
            className="w-full h-12 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Previous Address
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-2">
            You need {remainingMonths} more months to reach 3 years total
          </p>
        </div>
      )}

      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
        <h4 className="font-medium text-primary mb-2">Why we need address history</h4>
        <p className="text-sm text-muted-foreground">
          Lenders are required by law to verify your identity and address history. 
          This helps prevent fraud and ensures you get the best possible rates.
        </p>
      </div>
    </div>
  );
};

export default AddressHistoryStep;