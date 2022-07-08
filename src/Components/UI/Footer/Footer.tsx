/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'
import './Footer.scss'

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer__admin-info">
      <div className="admin-initials"> Made by Ruslan Pivovarov</div>
      <a href="https://github.com/mrspok407/tv-junkie" rel="noopener noreferrer" target="_blank">
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a href="https://twitter.com/mrspok407" rel="noopener noreferrer" target="_blank">
        <FontAwesomeIcon icon={faTwitter} />
      </a>
      <a className="tmdb-logo" href="https://www.themoviedb.org/" rel="noopener noreferrer" target="_blank" />
    </div>
  </footer>
)

export default Footer
