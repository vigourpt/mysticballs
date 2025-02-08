export interface FormValues {
  [key: string]: string | undefined;
  question?: string;
  name?: string;
  birthdate?: string;
  birthTime?: string;
  location?: string;
  numbers?: string;
  sign?: string;
  dream?: string;
  date?: string;
  description?: string;
  patterns?: string;
}

export interface FormProps {
  isDarkMode: boolean;
  inputClassName: string;
  labelClassName: string;
  values: FormValues;
  onChange: (field: string, value: string) => void;
}