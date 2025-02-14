import React from 'react';
import { FormProps } from './types';

const Magic8BallForm: React.FC<FormProps> = ({ 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <div className="mb-4">
    <label className={labelClassName}>Your Yes/No Question</label>
    <input
      type="text"
      value={values.question || ''}
      onChange={(e) => onChange('question', e.target.value)}
      className={inputClassName}
      placeholder="Ask me anything that can be answered with yes or no..."
      required
    />
  </div>
);

export default Magic8BallForm;
