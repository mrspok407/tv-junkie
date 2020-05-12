import React, { Component } from "react"

export default class Input extends Component {
  render() {
    const {
      classNameInput,
      classNameLabel,
      name,
      value,
      handleOnChange,
      handleBlur,
      type,
      placeholder,
      labelText,
      withLabel = false
    } = this.props
    return (
      <>
        {withLabel && (
          <label className={classNameLabel} htmlFor={name}>
            {labelText}
          </label>
        )}
        <input
          className={classNameInput}
          name={name}
          value={value}
          onChange={handleOnChange}
          onBlur={handleBlur}
          type={type}
          placeholder={placeholder}
        />
      </>
    )
  }
}
