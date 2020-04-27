import React from "react"
import Loader from "../Loader"
import "./PlaceholderLoadingFullInfo.scss"

export default ({ delayAnimation }) => (
  <div
    className="full-detailes full-detailes--placeholder"
    style={{ animationDelay: delayAnimation }}
  >
    <div className="full-detailes__poster-wrapper">
      <div className="full-detailes__poster full-detailes__poster--placeholder" />
    </div>

    <div className="full-detailes__info">
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>

      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
      <div className="full-detailes__info-row full-detailes__info-row--placeholder">
        <div className="full-detailes__info-value full-detailes__info-value--placeholder" />
      </div>
    </div>
  </div>
)
