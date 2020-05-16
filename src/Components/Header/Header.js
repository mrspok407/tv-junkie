/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/images/main-page-logo.png"
import Login from "./Login"
import * as ROUTES from "../../Utils/Constants/routes"
import { WithAuthenticationConsumer } from "../UserAuth/Session/WithAuthentication"
import "./Header.scss"
import "../UserAuth/UserAuth.scss"

class Header extends Component {
  render() {
    const { isLogoVisible = true } = this.props
    const isSignedIn = this.props.authUser

    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <NavLink exact to={ROUTES.SEARCH_PAGE} activeClassName="nav__item--active">
              <li data-item="1" className="nav__item">
                Search
              </li>
            </NavLink>

            <NavLink exact to={ROUTES.SHOWS} activeClassName="nav__item--active">
              <li data-item="2" className="nav__item">
                Your Shows
              </li>
            </NavLink>

            <NavLink exact to={ROUTES.MOVIES} activeClassName="nav__item--active">
              <li data-item="3" className="nav__item">
                Your Movies
              </li>
            </NavLink>

            {isSignedIn ? (
              <NavLink exact to={ROUTES.PROFILE}>
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
