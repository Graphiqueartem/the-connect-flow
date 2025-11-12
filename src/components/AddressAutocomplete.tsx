import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface AddressSuggestion {
  display: string;
  id?: string;
  postcode?: string;
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  state?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, details?: any) => void;
  className?: string;
  placeholder?: string;
}

const AddressAutocomplete = ({ value, onChange, className, placeholder }: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce function to limit API calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch UK address suggestions using getAddress.io via edge function
  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Fetching suggestions for:', query);

    try {
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: {
          action: 'autocomplete',
          term: query
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Autocomplete response:', data);

      let addressSuggestions: AddressSuggestion[] = [];

      if (data && data.suggestions && data.suggestions.length > 0) {
        // Map getAddress.io suggestions to our format
        addressSuggestions = data.suggestions.slice(0, 50).map((suggestion: any) => ({
          display: suggestion.address,
          id: suggestion.id,
          postcode: '', // Will be filled when user selects
          line1: '',
          line2: '',
          city: '',
          country: 'United Kingdom',
          state: ''
        }));

        // Always add manual entry option at the end
        addressSuggestions.push({
          display: "Can't see your address? Enter address manually"
        });

        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        // No results found, show manual entry
        setSuggestions([
          {
            display: "Enter address manually"
          }
        ]);
        setShowSuggestions(true);
      }
    } catch (error: any) {
      console.error('Address lookup failed:', error);
      setSuggestions([
        {
          display: "Enter address manually"
        }
      ]);
      setShowSuggestions(true);
    }

    setIsLoading(false);
  };

  // Debounced version of the fetch function
  const debouncedFetch = debounce(fetchAddressSuggestions, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length >= 2) {
      debouncedFetch(inputValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    // If it's a manual entry option, just use the current input value
    if (!suggestion.id) {
      onChange(value);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Fetch full address details using the ID
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: {
          action: 'get',
          id: suggestion.id
        }
      });

      if (error) {
        console.error('Error fetching address details:', error);
        throw error;
      }

      console.log('Full address details:', data);

      // Extract address components from getAddress.io response
      const line1 = [data.line_1, data.line_2].filter(Boolean).join(', ');
      const line2 = data.line_3 || '';
      const city = data.town_or_city || data.locality || '';
      const postcode = data.postcode || '';

      onChange(suggestion.display, {
        postcode: postcode,
        city: city,
        line1: line1,
        line2: line2
      });

    } catch (error) {
      console.error('Failed to fetch address details:', error);
      // Fallback to just using the display text
      onChange(suggestion.display);
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  const handleInputFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Location icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 z-10">
        <MapPin size={20} />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        className={`${className} pl-12`}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[100] max-h-80 overflow-y-auto mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm focus:bg-gray-50 focus:outline-none transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
            >
              <div className={`${!suggestion.postcode ? 'text-primary font-medium' : 'text-gray-900'}`}>
                {suggestion.display}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;