import React from 'react';
import { FormProps } from './types';

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const HoroscopeForm: React.FC<FormProps> = ({ 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <div className="mb-4">
    <label className={labelClassName}>Your Zodiac Sign</label>
    <select
      value={values.zodiac || ''}
      onChange={(e) => onChange('zodiac', e.target.value)}
      className={inputClassName}
      required
    >
      <option value="">Select your sign</option>
      {zodiacSigns.map(sign => (
        <option key={sign} value={sign}>{sign}</option>
      ))}
    </select>
  </div>
);

export default HoroscopeForm;
