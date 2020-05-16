/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import Input from "../Input/Input"
import "./SignUp.scss"

const INITIAL_STATE = {
  inputs: {
    login: ""
  },
  requiredInputs: {
    email: "",
    password: "",
    passwordConfirm: ""
  },
  errors: {
    emailError: "",
    emailOnBlur: false,
    passwordError: "",
    passwordOnBlur: false,
    passwordConfirmError: "",
    passwordConfirmOnblur: false,
    error: ""
  },
  submitClicked: false
}

class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    event.preventDefault()

    const requiredInputs = { ...this.state.requiredInputs }
    const { email, password } = requiredInputs
    const errors = { ...this.state.errors }
    const firebase = this.props.firebase
    const history = this.props.history

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
      .createUserWithEmailAndPassword(email, password)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE })
        history.push("/")
        console.log(`user created: ${authUser}`)
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
      const { email, password, passwordConfirm } = this.state.requiredInputs
      const errors = { ...this.state.errors }

      if (errors[`${name}OnBlur`] || this.state.submitClicked) {
        if (name === "email") {
          errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
        }

        if (name === "password") {
          errors[`${name}Error`] =
            password.length >= 6 ? "" : "Password should be at least 6 characters"

          errors.passwordConfirmError =
            password !== passwordConfirm && password.length >= 6 ? "Passwords are not the same" : ""
        }

        if (name === "passwordConfirm") {
          if (password.length >= 6)
            errors[`${name}Error`] =
              password !== passwordConfirm ? "Passwords are not the same" : ""
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
        requiredInputs: { ...prevState.requiredInputs, [name]: value },
        inputs: { ...prevState.inputs, [name]: value }
      }),
      validation
    )
  }

  handleValidationOnblur = event => {
    event.preventDefault()

    const { value, name } = event.target
    const { email, password, passwordConfirm } = this.state.requiredInputs
    const errors = { ...this.state.errors }

    errors[`${name}OnBlur`] = true

    if (!this.state.submitClicked) {
      if (name === "email") {
        errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
      }

      if (name === "password") {
        errors[`${name}Error`] =
          password.length >= 6 ? "" : "Password should be at least 6 characters"
      }

      if (name === "passwordConfirm") {
        if (password.length >= 6)
          errors[`${name}Error`] = password !== passwordConfirm ? "Passwords are not the same" : ""
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

    for (const value of Object.values(requiredInputs)) {
      if (value.length === 0) {
        isValid = false
      }
    }

    for (const value of Object.values(errors)) {
      if (value.length > 0) {
        isValid = false
      }
    }

    return isValid
  }

  render() {
    const { errors, requiredInputs } = this.state
    const { login } = this.state.inputs
    const { email, password, passwordConfirm } = this.state.requiredInputs
    const { error, emailError, passwordError, passwordConfirmError } = this.state.errors

    const isValid = this.isFormValid(errors, requiredInputs)

    return (
      <form className="form-auth" onSubmit={this.onSubmit}>
        <Input
          classNameInput="form-auth__input"
          classNameLabel="form-auth__label"
          name="login"
          value={login}
          handleOnChange={this.handleOnChange}
          type="text"
          placeholder="Login"
          labelText="Login"
          withLabel
        />

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
        <div className="form-auth__error">{emailError}</div>

        <Input
          classNameInput={
            passwordError ? "form-auth__input form-auth__input--error" : "form-auth__input"
          }
          classNameLabel="form-auth__label"
          name="password"
          value={password}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          type="text"
          placeholder="Password"
          labelText="Password"
          withLabel
        />
        <div className="form-auth__error">{passwordError}</div>

        <Input
          classNameInput={
            passwordConfirmError ? "form-auth__input form-auth__input--error" : "form-auth__input"
          }
          classNameLabel="form-auth__label"
          name="passwordConfirm"
          value={passwordConfirm}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          type="text"
          placeholder="Password"
          labelText="Confirm Password"
          withLabel
        />
        <div className="form-auth__error">{passwordConfirmError}</div>

        {error && <div className="form-auth__error">{error.message}</div>}

        <button
          className={
            !isValid ? "button button--form-auth button--disabled" : "button button--form-auth"
          }
          type="submit"
        >
          Sign Up
        </button>
      </form>
    )
  }
}

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase)

export default SignUpForm
