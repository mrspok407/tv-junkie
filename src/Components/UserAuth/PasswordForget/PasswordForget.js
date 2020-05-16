/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import Input from "../Input/Input"

const INITIAL_STATE = {
  requiredInputs: {
    email: ""
  },
  errors: {
    emailError: "",
    emailOnBlur: false,
    error: ""
  }
}

class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    event.preventDefault()
    const requiredInputs = { ...this.state.requiredInputs }
    const { email } = requiredInputs
    const errors = { ...this.state.errors }
    const firebase = this.props.firebase

    if (!this.isFormValid(errors, requiredInputs)) {
      for (const [key, value] of Object.entries(requiredInputs)) {
        if (value.length === 0) {
          errors[`${key}Error`] = "Required"
        }
      }
      this.setState({
        errors,
        submitClicked: true
      })
      return
    }

    firebase
      .passwordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE, emailSentSuccess: true })
      })
      .catch(error => {
        errors.error = error
        this.setState({ errors })
      })
  }

  handleOnChange = event => {
    event.preventDefault()
    const { value, name } = event.target

    const validation = () => {
      const { email } = this.state.requiredInputs
      const errors = { ...this.state.errors }

      if (errors[`${name}OnBlur`] || this.state.submitClicked) {
        if (name === "email") {
          errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
        }
      }

      if (value === "") {
        errors[`${name}Error`] = ""
        errors[`${name}OnBlur`] = false
        errors.error = ""
      }

      this.setState({
        errors
      })
    }

    this.setState(
      prevState => ({
        requiredInputs: { ...prevState.requiredInputs, [name]: value }
      }),
      validation
    )
  }

  handleValidationOnblur = event => {
    event.preventDefault()

    const { value, name } = event.target
    const { email } = this.state.requiredInputs
    const errors = { ...this.state.errors }

    errors[`${name}OnBlur`] = true

    if (!this.state.submitClicked) {
      if (name === "email") {
        errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
      }

      if (value === "") {
        errors[`${name}Error`] = ""
        errors[`${name}OnBlur`] = false
      }
    }

    this.setState({
      errors
    })
  }

  isFormValid = (errors, requiredInputs) => {
    let isValid = true

    isValid = !(requiredInputs.email.length === 0 || errors.emailError.length > 0)

    return isValid
  }

  render() {
    const { errors, requiredInputs, emailSentSuccess } = this.state
    const { email } = this.state.requiredInputs
    const { error, emailError } = this.state.errors

    const isValid = this.isFormValid(errors, requiredInputs)

    return (
      <form className="form-auth form-auth--password-forget" onSubmit={this.onSubmit}>
        <Input
          classNameInput={
            emailError ? "form-auth__input form-auth__input--error" : "form-auth__input"
          }
          classNameLabel="form-auth__label"
          name="email"
          value={email}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          type="text"
          placeholder="Email Address"
          labelText="Email"
          withLabel
        />
        {emailSentSuccess && (
          <div className="password-forget-message">Password reset link sent to your email</div>
        )}
        {emailError && <div className="form-auth__error">{emailError}</div>}
        {error && <div className="form-auth__error">{error.message}</div>}

        <button
          className={
            !isValid ? "button button--form-auth button--disabled" : "button button--form-auth"
          }
          type="submit"
        >
          Reset password
        </button>
      </form>
    )
  }
}

const PasswordForget = compose(withRouter, withFirebase)(PasswordForgetFormBase)

export default PasswordForget
