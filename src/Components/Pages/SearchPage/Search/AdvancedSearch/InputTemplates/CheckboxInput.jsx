/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { useField } from 'formik'

const CheckboxInput = ({ label, isChecked, className = '', ...props }) => {
  const [field, meta] = useField(props)
  return (
    <div className={`checkbox-input-container ${className}`}>
      <label>
        <input type="checkbox" {...field} {...props} /> {label}
        <span className="custom-checkmark" />
      </label>
      {meta.touched && meta.error ? <div>{meta.error}</div> : null}
    </div>
  )
}

export default CheckboxInput
