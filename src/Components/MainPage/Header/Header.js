import React, { Component } from "react"
import logo from "../../../assets/images/main-page-logo.png"
import "./Header.scss"

export default class Header extends Component {
  render() {
    return (
      <header className="header">
        <nav className="nav" />
        <div className="logo">
          <img className="logo__img" src={logo} alt="logo" />
        </div>
      </header>
    )
  }
}
