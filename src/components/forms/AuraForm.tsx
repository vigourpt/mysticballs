import React from 'react';
import { FormProps } from './types';

const AuraForm: React.FC<FormProps> = ({ 
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
      <label className={labelClassName}>Personality Description</label>
      <textarea
        value={values.personality || ''}
        onChange={(e) => onChange('personality', e.target.value)}
        className={`${inputClassName} h-32 resize-none`}
        placeholder="Describe your personality, emotions, and current energy levels..."
        required
      />
    </div>
  </>
);

export default AuraForm;