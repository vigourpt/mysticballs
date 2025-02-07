import React from 'react';
import { FormProps } from './types';

const DreamForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <div className="mb-4">
    <label className={labelClassName}>Describe Your Dream</label>
    <textarea
      value={values.dream || ''}
      onChange={(e) => onChange('dream', e.target.value)}
      className={`${inputClassName} h-32 resize-none`}
      placeholder="Describe your dream in detail..."
      required
    />
  </div>
);

export default DreamForm;