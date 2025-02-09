import React from 'react';
import { FormProps } from './types';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const AstrologyForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
    <div className="mb-4">
      <label className={labelClassName}>Your Zodiac Sign</label>
      <select
        value={values.sign || ''}
        onChange={(e) => onChange('sign', e.target.value)}
        className={inputClassName}
        required
      >
        <option value="">Select your sign</option>
        {ZODIAC_SIGNS.map(sign => (
          <option key={sign} value={sign.toLowerCase()}>
            {sign}
          </option>
        ))}
      </select>
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Birth Date</label>
      <input
        type="date"
        value={values.birthdate || ''}
        onChange={(e) => onChange('birthdate', e.target.value)}
        className={inputClassName}
        required
      />
    </div>
  </>
);

export default AstrologyForm;