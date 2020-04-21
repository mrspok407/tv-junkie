/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import logo from "../../assets/images/main-page-logo.png"
import "./Header.scss"

export default class Header extends Component {
  render() {
    const { isLogoVisible = true } = this.props

    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <NavLink
              exact
              to="/"
              activeClassName="nav__item--active"
              className="nav__item"
            >
              <li data-item="1">Search</li>
            </NavLink>

            <NavLink
              exact
              to="/shows"
              activeClassName="nav__item--active"
              className="nav__item"
            >
              <li data-item="2">Your Shows</li>
            </NavLink>
            <NavLink
              exact
              to="/movies"
              activeClassName="nav__item--active"
              className="nav__item"
            >
              <li data-item="3">Your Movies</li>
            </NavLink>
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

Header.contextType = SelectedContentContext
