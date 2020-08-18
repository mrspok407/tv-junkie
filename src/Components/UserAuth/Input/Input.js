import React, { Component } from "react"

export default class Input extends Component {
  // state = {
  //   value: "",
  //   isInvalid: false,
  //   validationText: ""
  // }

  // handleOnChange = e => {
  //   const { value, name } = e.target

  //   this.setState(
  //     prevState => ({
  //       value: value
  //     }),
  //     this.validateInput
  //   )
  // }

  // sanitizeInput = () => this.setState({ isInvalid: false, validationText: "" })

  // validateInput = () => {
  //   if (this.props.withValidation && this.props.validationCases) {
  //     const filteredCases = this.props.validationCases.filter(c => !!c.condition)
  //     const inputInvalid = filteredCases.length > 0
  //     if (inputInvalid) {
  //       this.setState({ isInvalid: true, validationText: filteredCases[0].text })
  //     } else {
  //       this.sanitizeInput()
  //     }
  //     return inputInvalid
  //   }
  //   return false
  // }

  render() {
    const {
      classNameInput,
      classNameLabel,
      name,
      autocomplete,
      value,
      handleOnChange,
      handleValidation,
      handleKeyDown,
      type,
      placeholder,
      labelText,
      withLabel = false,
      hidePasswordBtn,
      toggleShowPassword
    } = this.props

    return (
      <>
        {withLabel && (
          <label className={classNameLabel} htmlFor={name}>
            {labelText}
            {hidePasswordBtn && (
              <span
                className={
                  type === "password" ? "auth__form-label-show-password" : "auth__form-label-hide-password"
                }
                onClick={() => toggleShowPassword()}
              ></span>
            )}
          </label>
        )}
        <input
          className={classNameInput}
          autoComplete={autocomplete}
          name={name}
          value={value}
          onChange={handleOnChange}
          onBlur={handleValidation}
          onKeyDown={handleKeyDown}
          type={type}
          placeholder={placeholder}
        />
      </>
    )
  }
}
