/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import logo from "assets/images/main-page-logo.png"
import Login from "./Login"
import * as ROUTES from "Utils/Constants/routes"
import * as ROLES from "Utils/Constants/roles"
import { AuthUserContext } from "Components/UserAuth/Session/WithAuthentication"
import "./Header.scss"
import "../UserAuth/UserAuth.scss"

export default class Header extends Component {
  render() {
    const { isLogoVisible = true } = this.props
    const authUser = this.context

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

            {authUser ? (
              <>
                <NavLink exact to={ROUTES.PROFILE}>
                  <li data-item="4" className="nav__item">
                    Profile
                  </li>
                </NavLink>

                {!!authUser.roles[ROLES.ADMIN] && (
                  <NavLink exact to={ROUTES.ADMIN}>
                    <li data-item="4" className="nav__item">
                      Admin
                    </li>
                  </NavLink>
                )}
              </>
            ) : (
              <Login clearCurrentlyChosenContent={this.props.clearCurrentlyChosenContent} />
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

Header.contextType = AuthUserContext
