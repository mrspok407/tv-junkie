import React from 'react'
import { useField } from 'formik'
import './SelectInput.scss'

const SelectInput = ({ label, className = '', ...props }) => {
  const [field, meta] = useField(props)
  return (
    <div className={`select-input-container ${className}`}>
      <label htmlFor={props.id || props.name} className={className}>
        {label}
      </label>
      <select {...field} {...props} />
      {meta.touched && meta.error ? <div>{meta.error}</div> : null}
    </div>
  )
}

export default SelectInput
