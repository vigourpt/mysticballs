import React from 'react';
import { FormProps } from './types';

const AstrologyForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
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
    <div className="mb-4">
      <label className={labelClassName}>Birth Time (optional)</label>
      <input
        type="time"
        value={values.birthTime || ''}
        onChange={(e) => onChange('birthTime', e.target.value)}
        className={inputClassName}
      />
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Birth Location (optional)</label>
      <input
        type="text"
        value={values.location || ''}
        onChange={(e) => onChange('location', e.target.value)}
        className={inputClassName}
        placeholder="City, Country"
      />
    </div>
  </>
);

export default AstrologyForm;