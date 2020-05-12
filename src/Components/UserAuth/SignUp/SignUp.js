import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import "./SignUp.scss"
import Input from "../Input/Input"

const INITIAL_STATE = {
  login: "",
  email: "",
  password: "",
  passwordConfirm: "",
  error: null
}

class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const { email, password } = this.state
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
        this.setState({ error })
        console.log("error")
      })

    event.preventDefault()
  }

  handleOnChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const { login, email, password, passwordConfirm, error } = this.state
    const isInvalid =
      password !== passwordConfirm || password === "" || email === "" || login === ""

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
          classNameInput="form-auth__input"
          classNameLabel="form-auth__label"
          name="email"
          value={email}
          handleOnChange={this.handleOnChange}
          type="text"
          placeholder="Email Address"
          labelText="Email"
          withLabel
        />

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

        <Input
          classNameInput="form-auth__input"
          classNameLabel="form-auth__label"
          name="passwordConfirm"
          value={passwordConfirm}
          handleOnChange={this.handleOnChange}
          type="password"
          placeholder="Password"
          labelText="Confirm Password"
          withLabel
        />

        {!isInvalid && error && <div className="form-auth__error">{error.message}</div>}

        <button
          className={
            isInvalid ? "button button--form-auth button--disabled" : "button button--form-auth"
          }
          disabled={isInvalid}
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
