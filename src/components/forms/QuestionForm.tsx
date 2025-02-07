import React from 'react';
import { FormProps } from './types';

const QuestionForm: React.FC<FormProps> = ({ 
  isDarkMode, 
  inputClassName, 
  labelClassName,
  values,
  onChange 
}) => (
  <div className="mb-4">
    <label className={labelClassName}>Your Question</label>
    <textarea
      value={values.question || ''}
      onChange={(e) => onChange('question', e.target.value)}
      className={`${inputClassName} h-32 resize-none`}
      placeholder="What would you like to know?"
      required
    />
  </div>
);

export default QuestionForm;