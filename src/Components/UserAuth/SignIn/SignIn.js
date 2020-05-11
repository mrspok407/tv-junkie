import React, { Component, useState, useEffect } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "../../Firebase"
import { SignUpLink } from "../SignUp/SignUp"
import Header from "../../Header/Header"
import "./SignIn.scss"

const INITIAL_STATE = {
  email: "",
  password: ""
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

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const { email, password, error } = this.state
    const isInvalid = password === "" || email === ""

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
    )
  }
}

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase)

const SignInPage = () => (
  <>
    <Header />
    <div className="sign-in">
      <h1>SignIn</h1>
      <SignInForm />
      <SignUpLink />
    </div>
  </>
)

export default SignInPage

export { SignInForm }
