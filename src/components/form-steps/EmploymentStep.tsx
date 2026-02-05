import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "../CarFinanceForm";
import { Briefcase, DollarSign } from "lucide-react";

interface EmploymentStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const employmentStatuses = [
  { value: "full-time", label: "Full-time employed" },
  { value: "part-time", label: "Part-time employed" },
  { value: "self-employed", label: "Self-employed" },
  { value: "contract", label: "Contract/Temporary" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "benefits", label: "Receiving benefits" },
  { value: "other", label: "Other" },
];

const EmploymentStep = ({ formData, updateFormData, errors }: EmploymentStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Employment & Income</h3>
        <p className="text-muted-foreground">
          Help us understand your financial situation to find the best rates
        </p>
      </div>

      {/* Employment Status */}
      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Employment Status *
        </Label>
        <Select
          value={formData.employmentStatus}
          onValueChange={(value) => updateFormData({ employmentStatus: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your employment status" />
          </SelectTrigger>
          <SelectContent>
            {employmentStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employmentStatus && (
          <p className="text-destructive text-sm mt-1">{errors.employmentStatus}</p>
        )}
      </div>

      {/* Monthly Income */}
      <div className="space-y-2">
        <Label htmlFor="monthlyIncome" className="text-base font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Monthly Income (Before Tax) *
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            £
          </span>
          <Input
            id="monthlyIncome"
            type="number"
            placeholder="3,000"
            value={formData.monthlyIncome}
            onChange={(e) => updateFormData({ monthlyIncome: e.target.value })}
            className="h-12 pl-8"
            min="0"
            step="100"
          />
        </div>
        {errors.monthlyIncome && (
          <p className="text-destructive text-sm mt-1">{errors.monthlyIncome}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter your gross monthly income (before deductions)
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-primary mb-2">Why we need this</h4>
          <p className="text-sm text-muted-foreground">
            Lenders use your employment and income information to assess your ability 
            to make monthly repayments and offer you the best possible rates.
          </p>
        </div>
        
        <div className="bg-success/5 p-4 rounded-lg border border-success/20">
          <h4 className="font-medium text-success mb-2">Your data is safe</h4>
          <p className="text-sm text-muted-foreground">
            All information is encrypted and only shared with FCA-regulated lenders 
            to provide you with finance quotes.
          </p>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Higher income and stable employment typically 
          lead to better interest rates and more financing options.
        </p>
      </div>
    </div>
  );
};

export default EmploymentStep;