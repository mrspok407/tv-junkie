/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import { validEmailRegex } from "Utils"
import classNames from "classnames"
import Input from "../Input/Input"

const INITIAL_STATE = {
  requiredInputs: {
    email: ""
  },
  errors: {
    emailError: "",
    emailOnBlur: false,
    error: ""
  },
  submitRequestLoading: false
}

class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    event.preventDefault()
    const { email } = this.state.requiredInputs
    const errors = { ...this.state.errors }

    if (!this.isFormValid(errors, this.state.requiredInputs)) {
      for (const [key, value] of Object.entries(this.state.requiredInputs)) {
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

    this.setState({ submitRequestLoading: true })

    this.props.firebase
      .passwordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE, emailSentSuccess: true })
      })
      .catch(error => {
        errors.error = error
        this.setState({ errors, submitRequestLoading: false })
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
          errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
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
        errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
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

  handleKeyDown = e => e.which === 27 && this.resetInput(e.target.name)

  resetInput = name => {
    this.setState({
      requiredInputs: { ...this.state.requiredInputs, [`${name}`]: "" },
      errors: { ...this.state.errors, [`${name}Error`]: "" }
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
      <form className="auth__form" onSubmit={this.onSubmit}>
        <Input
          classNameInput={classNames("auth__form-input", {
            "auth__form-input--error": emailError
          })}
          classNameLabel="auth__form-label"
          name="email"
          value={email}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          handleKeyDown={this.handleKeyDown}
          type="text"
          placeholder="Email Address"
          labelText="Email"
          withLabel
        />
        {emailSentSuccess && (
          <div className="auth__form-password-message">Password reset link sent to your email</div>
        )}
        {emailError && <div className="auth__form-error">{emailError}</div>}
        {error && <div className="auth__form-error">{error.message}</div>}

        <button
          className={classNames("button button--auth__form", {
            "button--disabled": !isValid
          })}
          type="submit"
        >
          {this.state.submitRequestLoading ? <span className="auth__form-loading"></span> : "Reset Password"}
        </button>
      </form>
    )
  }
}

const PasswordForget = compose(withRouter, withFirebase)(PasswordForgetFormBase)

export default PasswordForget
