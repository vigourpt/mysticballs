import React from 'react';
import { FormProps } from './types';

const AngelNumbersForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <>
    <div className="mb-4">
      <label className={labelClassName}>Your Name</label>
      <input
        type="text"
        value={values.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        className={inputClassName}
        placeholder="Enter your name"
        required
      />
    </div>
    <div className="mb-4">
      <label className={labelClassName}>Recurring Number</label>
      <input
        type="text"
        value={values.number || ''}
        onChange={(e) => onChange('number', e.target.value)}
        className={inputClassName}
        placeholder="Enter the number you keep seeing"
        required
      />
    </div>
  </>
);

export default AngelNumbersForm;