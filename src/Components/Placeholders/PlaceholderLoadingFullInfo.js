import React from "react"
import Loader from "./Loader"

export default ({ delayAnimation }) => (
  <div
    className="full-detailes full-detailes--placeholder"
    style={{ animationDelay: delayAnimation }}
  >
    <div className="full-detailes__poster-wrapper">
      <div className="full-detailes__poster full-detailes__poster--placeholder">
        <Loader />
      </div>
    </div>

    <div className="full-detailes__info">
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Year</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Status</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>

      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Genres</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Company</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Rating</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Runtime</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Tagline</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-option">Budget</div>
        <div className="full-detailes__info-value full-detailes__info-value--placeholder">
          {" "}
          <Loader className="loader--small-pink" />
        </div>
      </div>
    </div>
  </div>
)
