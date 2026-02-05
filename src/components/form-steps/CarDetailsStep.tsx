import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Truck } from "lucide-react";
import { FormData } from "../CarFinanceForm";

interface CarDetailsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const carMakes = [
  "Audi", "BMW", "Ford", "Honda", "Hyundai", "Kia", "Mercedes-Benz", 
  "Nissan", "Peugeot", "Renault", "Toyota", "Vauxhall", "Volkswagen", "Volvo"
];

const priceRanges = [
  "Under £5,000",
  "£5,000 - £10,000", 
  "£10,000 - £15,000",
  "£15,000 - £20,000",
  "£20,000 - £30,000",
  "£30,000 - £50,000",
  "Over £50,000"
];

const CarDetailsStep = ({ formData, updateFormData, errors }: CarDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">What car are you looking for?</h3>
        <p className="text-muted-foreground">
          Tell us about the vehicle you'd like to finance
        </p>
      </div>

      {/* Vehicle Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Vehicle Type *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`form-option-card ${
              formData.vehicleType === "new" ? "selected" : ""
            }`}
            onClick={() => updateFormData({ vehicleType: "new" })}
          >
            <div className="flex items-center space-x-3">
              <Car className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-medium">New Car</h4>
                <p className="text-sm text-muted-foreground">
                  Brand new vehicles from dealerships
                </p>
              </div>
            </div>
          </div>
          
          <div
            className={`form-option-card ${
              formData.vehicleType === "used" ? "selected" : ""
            }`}
            onClick={() => updateFormData({ vehicleType: "used" })}
          >
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-medium">Used Car</h4>
                <p className="text-sm text-muted-foreground">
                  Pre-owned vehicles in good condition
                </p>
              </div>
            </div>
          </div>
        </div>
        {errors.vehicleType && (
          <p className="text-destructive text-sm mt-1">{errors.vehicleType}</p>
        )}
      </div>

      {/* Make Selection */}
      <div className="space-y-2">
        <Label htmlFor="make" className="text-base font-medium">
          Make *
        </Label>
        <Select
          value={formData.make}
          onValueChange={(value) => updateFormData({ make: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select car make" />
          </SelectTrigger>
          <SelectContent>
            {carMakes.map((make) => (
              <SelectItem key={make} value={make}>
                {make}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.make && (
          <p className="text-destructive text-sm mt-1">{errors.make}</p>
        )}
      </div>

      {/* Model Input */}
      <div className="space-y-2">
        <Label htmlFor="model" className="text-base font-medium">
          Model (Optional)
        </Label>
        <Input
          id="model"
          placeholder="e.g. Golf, Focus, A4"
          value={formData.model}
          onChange={(e) => updateFormData({ model: e.target.value })}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank if you're not sure - we can help you find the right model
        </p>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label htmlFor="priceRange" className="text-base font-medium">
          Price Range *
        </Label>
        <Select
          value={formData.priceRange}
          onValueChange={(value) => updateFormData({ priceRange: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.priceRange && (
          <p className="text-destructive text-sm mt-1">{errors.priceRange}</p>
        )}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Good to know:</strong> We work with trusted dealers across the UK 
          to find you the best deals on both new and used cars.
        </p>
      </div>
    </div>
  );
};

export default CarDetailsStep;