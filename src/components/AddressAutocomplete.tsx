import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Pencil } from "lucide-react";

interface AddressSuggestion {
  display: string;
  id?: string;
  postcode?: string;
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  state?: string;
  kind?: "address" | "query" | "manual";
  source?: "getaddress" | "google";
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, details?: any) => void;
  className?: string;
  placeholder?: string;
}

// Normalizes a UK postcode to uppercase with a single space before the inward code
const formatPostcode = (value: string) => {
  const cleaned = value.replace(/\s+/g, "").toUpperCase();
  const postcodeRegex = /^([A-Z]{1,2}[0-9][0-9A-Z]?)[0-9][A-Z]{2}$/;

  if (!postcodeRegex.test(cleaned)) {
    return value;
  }

  return `${cleaned.slice(0, cleaned.length - 3)} ${cleaned.slice(-3)}`;
};

const isFullPostcode = (value: string) => {
  const cleaned = value.replace(/\s+/g, "").toUpperCase();
  const postcodeRegex = /^([A-Z]{1,2}[0-9][0-9A-Z]?)[0-9][A-Z]{2}$/;
  return postcodeRegex.test(cleaned);
};

const AddressAutocomplete = ({ value, onChange, className, placeholder }: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [disableGetAddress, setDisableGetAddress] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const minSuggestions = 6;
  const hasSelectedAddress = value.trim().length > 0;
  const selectedLines = value
    .split(",")
    .map((line) => line.trim())
    .filter(Boolean);

  const invokeAddressLookup = async (body: Record<string, unknown>) => {
    const timeoutMs = 5500;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Address lookup timed out")), timeoutMs);
    });
    const response = await Promise.race([
      supabase.functions.invoke("address-lookup", { body }),
      timeoutPromise,
    ]);
    return response as { data: any; error: any };
  };

  const buildSuggestions = (items: AddressSuggestion[]) => {
    if (items.length > 0) {
      return [
        ...items,
        { display: "Can't see your address? Enter address manually", kind: "manual" as const },
      ];
    }
    return [{ display: "Enter address manually", kind: "manual" as const }];
  };

  const applySuggestions = (items: AddressSuggestion[], requestId: number) => {
    if (requestId !== requestIdRef.current) return;
    setSuggestions(buildSuggestions(items));
    setShowSuggestions(true);
    setIsLoading(false);
  };

  // Fetch UK address suggestions using EasyPostcodes via edge function
  const fetchAddressSuggestions = async (query: string, mode: "autocomplete" | "postcode" = "autocomplete") => {
    const requestId = ++requestIdRef.current;
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Fetching suggestions for:', query, 'mode:', mode);

    try {
      if (disableGetAddress) {
        applySuggestions([], requestId);
        return;
      }

      const lookupTerm = query.replace(/\s+/g, "");
      const action = isFullPostcode(query) ? 'postcode' : 'autocomplete';

      const response = await invokeAddressLookup({
        action,
        term: lookupTerm,
      });

      const data = response.data;
      const error = response.error;

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Address response:', data);

      let addressSuggestions: AddressSuggestion[] = [];

      if (action === 'postcode' && data?.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
        // Postcode lookup returns fully resolved addresses
        addressSuggestions = data.addresses.map((addr: any) => ({
          display: addr.display,
          postcode: addr.postcode,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          country: addr.country || 'United Kingdom',
          kind: "address" as const,
        }));
      } else if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        // Autocomplete-style results (postcode detected in term)
        addressSuggestions = data.suggestions.map((suggestion: any) => ({
          display: suggestion.address,
          postcode: suggestion.postcode,
          line1: suggestion.line1,
          line2: suggestion.line2,
          city: suggestion.city,
          country: 'United Kingdom',
          kind: "address" as const,
        }));
      }

      if (requestId !== requestIdRef.current) return;

      applySuggestions(addressSuggestions, requestId);
    } catch (error: any) {
      console.error('Address lookup failed:', error);
      const isUnauthorized = typeof error?.message === "string" && error.message.includes("401");
      if (isUnauthorized) {
        setDisableGetAddress(true);
      }
      applySuggestions([], requestId);
    }

    if (requestId === requestIdRef.current) {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    const normalizedValue = manualMode ? nextValue : formatPostcode(nextValue);

    setInputValue(normalizedValue);

    if (manualMode) {
      onChange(normalizedValue);
      if (normalizedValue.length === 0) {
        setManualMode(false);
      }
    } else if (hasSelectedAddress && normalizedValue.length > 0) {
      onChange("");
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (normalizedValue.length === 0) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    const shouldSearch = normalizedValue.length >= 2;

    if (!manualMode && shouldSearch) {
      const mode = isFullPostcode(normalizedValue) ? "postcode" : "autocomplete";
      debounceRef.current = setTimeout(() => {
        fetchAddressSuggestions(normalizedValue, mode);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    // If it's a manual entry option, switch to manual mode
    if (suggestion.kind === "manual") {
      setManualMode(true);
      onChange("");
      setShowSuggestions(false);
      setSuggestions([]);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      inputRef.current?.focus();
      return;
    }

    // If it's a query suggestion, update input and fetch refined results
    if (suggestion.kind === "query") {
      setManualMode(false);
      setInputValue(suggestion.display);
      setShowSuggestions(false);
      setSuggestions([]);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      fetchAddressSuggestions(suggestion.display, isFullPostcode(suggestion.display) ? "postcode" : "autocomplete");
      return;
    }

    // EasyPostcodes returns full address details directly - no secondary "get" call needed
    setManualMode(false);
    if (suggestion.postcode) {
      setInputValue(suggestion.postcode);
    }
    onChange(suggestion.display, {
      postcode: suggestion.postcode,
      city: suggestion.city,
      line1: suggestion.line1,
      line2: suggestion.line2,
    });
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  const handleInputFocus = () => {
    if (!manualMode && inputValue.length >= 2 && suggestions.length > 0) {
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

    return (
      <div ref={wrapperRef} className="w-full">
        <div className="relative w-full">
          {/* Location icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 z-10">
            <MapPin size={20} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
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

          {/* Manual entry pencil */}
          {!hasSelectedAddress && (
            <button
              type="button"
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => {
                setManualMode(true);
                setShowSuggestions(false);
                setSuggestions([]);
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                inputRef.current?.focus();
              }}
              aria-label="Enter address manually"
            >
              <Pencil size={18} />
            </button>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[100] max-h-80 overflow-y-auto mt-1">
              {suggestions.map((suggestion, index) => {
                const isManual = suggestion.kind === "manual";
                const isQuery = suggestion.kind === "query";
                const textClassName = isManual
                  ? "text-primary font-medium"
                  : isQuery
                    ? "text-gray-700"
                    : "text-gray-900";

              return (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm focus:bg-gray-50 focus:outline-none transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(suggestion);
                    }}
                  >
                    <div className={textClassName}>
                      {suggestion.display}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {hasSelectedAddress && (
          <div className="mt-4 rounded-2xl border border-success/20 bg-success/10 p-4 text-left text-gray-900 relative">
            <div className="pr-10 space-y-1">
              {selectedLines.map((line, index) => (
                <p key={index} className="text-base leading-snug">
                  {line}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => {
                setManualMode(true);
                setInputValue(value);
                setShowSuggestions(false);
                setSuggestions([]);
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                inputRef.current?.focus();
              }}
              aria-label="Edit selected address"
            >
              <Pencil size={18} />
            </button>
          </div>
        )}
      </div>
    );
};

export default AddressAutocomplete;
