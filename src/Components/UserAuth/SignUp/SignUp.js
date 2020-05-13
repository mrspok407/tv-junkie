/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import "./SignUp.scss"
import Input from "../Input/Input"

const INITIAL_STATE = {
  inputs: {
    login: "",
    email: "",
    password: "",
    passwordConfirm: ""
  },
  errors: {
    emailError: "",
    passwordError: "",
    passwordOnBlur: false,
    passwordConfirmError: "",
    error: ""
  }
}

class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const errors = { ...this.state.errors }
    const { email, password } = this.state.inputs
    const firebase = this.props.firebase
    const history = this.props.history

    firebase
      .createUserWithEmailAndPassword(email, password)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE })
        history.push("/")
        console.log(`user created: ${authUser}`)
      })
      .catch(error => {
        errors.error = error
        this.setState({
          errors
        })
        console.log("error")
      })

    event.preventDefault()
  }

  handleOnChange = event => {
    const { value, name } = event.target

    const testFun = () => {
      const { email, password, passwordConfirm } = this.state.inputs
      const errors = { ...this.state.errors }
      console.log(this.state.inputs)
      console.log(errors)

      if (name === "email") {
        if (errors[`${name}Error`].length !== 0) {
          errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
        }
      }

      if (name === "password") {
        if (errors.passwordOnBlur) {
          // TODO поместить всё под этот кондишен errors[`${name}OnBlur`]
          errors[`${name}Error`] =
            password.length >= 6 ? "" : "Password should be at least 6 characters"

          errors.passwordConfirmError =
            password !== passwordConfirm && password.length >= 6 ? "Passwords are not the same" : ""
        }
      }

      if (name === "passwordConfirm") {
        if (password.length >= 6)
          errors[`${name}Error`] = password !== passwordConfirm ? "Passwords are not the same" : ""
      }

      if (value === "") {
        errors[`${name}Error`] = ""
        errors[`${name}OnBlur`] = false
      }

      this.setState({
        errors
      })
    }

    this.setState(prevState => ({ inputs: { ...prevState.inputs, [name]: value } }), testFun)

    event.preventDefault()
  }

  handleValidation = event => {
    const { value, name } = event.target

    const { email, password, passwordConfirm } = this.state.inputs
    const errors = { ...this.state.errors }

    if (name === "email") {
      errors[`${name}Error`] = email.includes("@") ? "" : "Invalid email"
    }

    if (name === "password") {
      errors.passwordOnBlur = true // TODO переместить из кондишена errors[`${name}OnBlur`], универсальным сделать
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

    this.setState({
      errors
    })

    event.preventDefault()
  }

  isFormValid = (errors, inputs) => {
    // TODO тут ничё не сделано
    let isValid = true

    for (const value of Object.values(inputs)) {
      if (value.length === 0) {
        isValid = false
        return
      }
    }

    for (const value of Object.values(errors)) {
      if (value.length > 0) {
        isValid = false
        return
      }
    }

    // isValid = inputs.password === inputs.passwordConfirm

    return isValid
  }

  render() {
    const { errors, inputs } = this.state
    const { login, email, password, passwordConfirm } = this.state.inputs
    const { error, emailError, passwordError, passwordConfirmError } = this.state.errors

    const isValid = this.isFormValid(errors, inputs)

    console.log(isValid)

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
          handleValidation={this.handleValidation}
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
          handleValidation={this.handleValidation}
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
          handleValidation={this.handleValidation}
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
          disabled={!isValid}
          type="submit"
        >
          Sign In
        </button>
      </form>
    )
  }
}

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase)

export default SignUpForm
