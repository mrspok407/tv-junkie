import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import { validEmailRegex } from "../../../Utils"
import Input from "../Input/Input"
import "./SignIn.scss"

const INITIAL_STATE = {
  email: "",
  password: "",
  emailError: "",
  passwordError: "",
  error: ""
}

class SignInFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const { email, password } = this.state
    const firebase = this.props.firebase
    const history = this.props.history

    firebase
      .signInWithEmailAndPassword(email, password)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE })
        history.push("/")
        console.log(`user sign in: ${authUser}`)
      })
      .catch(error => {
        this.setState({ error })
        console.log("error")
      })

    event.preventDefault()
  }

  handleOnChange = event => {
    this.setState({ [event.target.name]: event.target.value })
    this.setState({ error: event.target.value === "" && "" })

    event.preventDefault()
  }

  handleValidation = event => {
    const { value, name } = event.target

    this.setState(prevState => ({
      emailError: validEmailRegex.test(prevState.email) ? "" : "Invalid email"
    }))

    if (value === "") {
      this.setState({
        [`${name}Error`]: ""
      })
    }

    event.preventDefault()
  }

  render() {
    const { email, password, error, emailError } = this.state
    const isInvalid = !!(emailError || !email)

    return (
      <form className="form-auth" onSubmit={this.onSubmit}>
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
        <div className="form-auth__error">{this.state.emailError}</div>

        <Input
          classNameInput="form-auth__input"
          classNameLabel="form-auth__label"
          name="password"
          value={password}
          handleOnChange={this.handleOnChange}
          type="password"
          placeholder="Password"
          labelText="Password"
          withLabel
        />

        {!isInvalid && error && <div className="form-auth__error">{error.message}</div>}

        <button
          className={
            isInvalid ? "button button--form-auth button--disabled" : "button button--form-auth"
          }
          onClick={() => console.log("Test")}
          disabled={isInvalid}
          type="submit"
        >
          Sign In
        </button>
      </form>
    )
  }
}

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase)

export default SignInForm
