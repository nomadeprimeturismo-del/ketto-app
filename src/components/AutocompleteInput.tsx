import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AutocompleteInputProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export default function AutocompleteInput({ onPlaceSelect, onChange, placeholder, className, defaultValue }: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      componentRestrictions: { country: 'br' }
    };

    const ac = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(ac);

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.geometry) {
        if (onPlaceSelectRef.current) onPlaceSelectRef.current(place);
        const newValue = place.formatted_address || place.name || '';
        setInputValue(newValue);
        if (onChangeRef.current) onChangeRef.current(newValue);
        
        // Force blur to close the dropdown
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    });

    return () => {
      if (ac) {
        google.maps.event.clearInstanceListeners(ac);
      }
    };
  }, [places]); // Only re-run when places library loads

  useEffect(() => {
    if (defaultValue !== undefined) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => {
        const val = e.target.value;
        setInputValue(val);
        if (onChange) onChange(val);
      }}
      className={className}
    />
  );
}
