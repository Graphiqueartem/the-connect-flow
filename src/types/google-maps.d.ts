declare global {
  namespace google {
    namespace maps {
      namespace places {
        class AutocompleteService {
          constructor();
          getPlacePredictions(
            request: AutocompletionRequest,
            callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
          ): void;
        }

        class PlacesService {
          constructor(container: HTMLDivElement);
        }

        interface AutocompletionRequest {
          input: string;
          componentRestrictions?: ComponentRestrictions;
          types?: string[];
          fields?: string[];
        }

        interface AutocompletePrediction {
          description: string;
          place_id: string;
          structured_formatting?: {
            main_text: string;
            secondary_text: string;
          };
        }

        enum PlacesServiceStatus {
          OK = 'OK',
          ZERO_RESULTS = 'ZERO_RESULTS',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          INVALID_REQUEST = 'INVALID_REQUEST',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR'
        }

        class Autocomplete {
          constructor(
            inputField: HTMLInputElement,
            opts?: AutocompleteOptions
          );
          addListener(eventName: string, handler: () => void): void;
          getPlace(): PlaceResult;
        }

        interface AutocompleteOptions {
          types?: string[];
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
        }

        interface ComponentRestrictions {
          country?: string | string[];
        }

        interface PlaceResult {
          formatted_address?: string;
          address_components?: AddressComponent[];
          geometry?: {
            location: {
              lat(): number;
              lng(): number;
            };
          };
          place_id?: string;
          types?: string[];
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }
      }

      namespace event {
        function clearInstanceListeners(instance: any): void;
      }
    }
  }
}

export {};