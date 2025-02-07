export interface FormValues {
  question?: string;
  name?: string;
  birthdate?: string;
  birthTime?: string;
  location?: string;
  number?: string;
  zodiacSign?: string;
  dream?: string;
  date?: string;
}

export interface FormProps {
  isDarkMode: boolean;
  inputClassName: string;
  labelClassName: string;
  values: FormValues;
  onChange: (field: string, value: string) => void;
}