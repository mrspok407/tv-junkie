import React, { Component } from "react"
import "./Footer.scss"

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="footer__admin-info">
          Made by Ruslan Pivovarov{" "}
          <a href="https://github.com/mrspok407/tv-junkie" rel="noopener noreferrer" target="_blank">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://twitter.com/mrspok407" rel="noopener noreferrer" target="_blank">
            <i className="fab fa-twitter"></i>
          </a>
        </div>
      </footer>
    )
  }
}
