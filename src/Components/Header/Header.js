/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/images/main-page-logo.png"
import Login from "./Login"
import "./Header.scss"
import { WithAuthenticationConsumer } from "../UserAuth/Session"

class Header extends Component {
  render() {
    const { isLogoVisible = true } = this.props
    const isSignedIn = this.props.authUser

    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <NavLink exact to="/" activeClassName="nav__item--active">
              <li data-item="1" className="nav__item">
                Search
              </li>
            </NavLink>

            <NavLink exact to="/shows" activeClassName="nav__item--active">
              <li data-item="2" className="nav__item">
                Your Shows
              </li>
            </NavLink>

            <NavLink exact to="/movies" activeClassName="nav__item--active">
              <li data-item="3" className="nav__item">
                Your Movies
              </li>
            </NavLink>

            {isSignedIn ? (
              <NavLink exact to="/profile">
                <li data-item="4" className="nav__item">
                  Profile
                </li>
              </NavLink>
            ) : (
              <Login />
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
