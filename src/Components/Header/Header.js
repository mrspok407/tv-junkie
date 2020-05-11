/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/images/main-page-logo.png"
import "./Header.scss"
import SignOutButton from "../UserAuth/SignOut/SignOutButton"
import { WithAuthenticationConsumer } from "../UserAuth/Session"

class Header extends Component {
  render() {
    const { isLogoVisible = true } = this.props
    const isSignedIn = this.props.authUser

    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <NavLink exact to="/" activeClassName="nav__item--active" className="nav__item">
              <li data-item="1">Search</li>
            </NavLink>

            <NavLink exact to="/shows" activeClassName="nav__item--active" className="nav__item">
              <li data-item="2">Your Shows</li>
            </NavLink>
            <NavLink exact to="/movies" activeClassName="nav__item--active" className="nav__item">
              <li data-item="3">Your Movies</li>
            </NavLink>

            {isSignedIn ? (
              <div className="nav__item">
                <li data-item="5">
                  <SignOutButton />
                </li>
              </div>
            ) : (
              <>
                <NavLink
                  exact
                  to="/signin"
                  activeClassName="nav__item--active"
                  className="nav__item"
                >
                  <li data-item="4">Sign In</li>
                </NavLink>
                <NavLink
                  exact
                  to="/signup"
                  activeClassName="nav__item--active"
                  className="nav__item"
                >
                  <li data-item="4">Sign Up</li>
                </NavLink>
              </>
            )}
          </ul>
        </nav>
        <div
          className="logo"
          style={
            isLogoVisible
              ? {
                  display: "inherit"
                }
              : {
                  display: "none"
                }
          }
        >
          <img className="logo__img" src={logo} alt="logo" />
        </div>
      </header>
    )
  }
}

export default WithAuthenticationConsumer(Header)
