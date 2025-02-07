import React from 'react';
import { FormProps } from './types';

const NumerologyForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
    <div className="mb-4">
      <label className={labelClassName}>Full Name</label>
      <input
        type="text"
        value={values.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        className={inputClassName}
        placeholder="Enter your full name"
        required
      />
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

export default NumerologyForm;