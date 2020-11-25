/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react"
import "./Footer.scss"

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__admin-info">
        <div className="admin-initials"> Made by Ruslan Pivovarov</div>
        <a href="https://github.com/mrspok407/tv-junkie" rel="noopener noreferrer" target="_blank">
          <i className="fab fa-github"></i>
        </a>
        <a href="https://twitter.com/mrspok407" rel="noopener noreferrer" target="_blank">
          <i className="fab fa-twitter"></i>
        </a>
        <a
          className="tmdb-logo"
          href="https://www.themoviedb.org/"
          rel="noopener noreferrer"
          target="_blank"
        ></a>
      </div>
    </footer>
  )
}

export default Footer
