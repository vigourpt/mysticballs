export interface FormValues {
  [key: string]: string | undefined;
  // For question-based readings (tarot, oracle, runes, iching, magic8ball)
  question?: string;
  
  // For personal info
  name?: string;
  birthdate?: string;
  
  // For astrology
  sign?: string;
  
  // For angel numbers
  number?: string;
  
  // For horoscope
  zodiacSign?: string;
  
  // For dreams
  dream?: string;
  
  // For aura reading
  personality?: string;
  
  // For past life
  timePeriod?: string;
}

export interface FormProps {
  isDarkMode: boolean;
  inputClassName: string;
  labelClassName: string;
  values: FormValues;
  onChange: (field: string, value: string) => void;
}