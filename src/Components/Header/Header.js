/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/images/main-page-logo.png"
import "./Header.scss"

export default class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      opacity: null,
      translateX: null
    }
  }

  componentDidMount() {
    this.hoverMenuDefault()
  }

  hoverMenuEnter = e => {
    const navItemOffsetLeft = e.offsetLeft

    this.setState({
      opacity: 1,
      translateX: navItemOffsetLeft,
      transition: 0.5
    })
  }

  hoverMenuDefault = () => {
    const navItemActive = document.querySelector(".nav__item--active")
    const navItemOffsetLeft = navItemActive.offsetLeft

    this.setState({
      opacity: 1,
      translateX: navItemOffsetLeft
    })
  }

  render() {
    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <NavLink exact to="/" activeClassName="nav__item--active">
              <li
                data-item="1"
                onMouseEnter={e => this.hoverMenuEnter(e.target)}
                onMouseLeave={() => this.hoverMenuDefault()}
                className="nav__item"
              >
                Search
              </li>
            </NavLink>

            <NavLink to="/shows" activeClassName="nav__item--active">
              <li
                data-item="2"
                onMouseEnter={e => this.hoverMenuEnter(e.target)}
                onMouseLeave={() => this.hoverMenuDefault()}
                className="nav__item"
              >
                Your Shows
              </li>
            </NavLink>
            <NavLink to="/movies" activeClassName="nav__item--active">
              <li
                data-item="3"
                onMouseEnter={e => this.hoverMenuEnter(e.target)}
                onMouseLeave={() => this.hoverMenuDefault()}
                className="nav__item"
              >
                Your Movies
              </li>
            </NavLink>

            <div
              style={{
                opacity: this.state.opacity,
                transform: `translate(${this.state.translateX}px, 0)`,
                transition: `${this.state.transition}s`
              }}
              className="nav__hover-line"
            />
          </ul>
        </nav>
        <div className="logo">
          <img className="logo__img" src={logo} alt="logo" />
        </div>
      </header>
    )
  }
}
