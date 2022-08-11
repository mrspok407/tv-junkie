import React from 'react'
import './PlaceholderLoadingFullInfo.scss'

const PlaceholderLoadingFullInfo = ({ delayAnimation }) => {
  return (
    <div className="details-page details-page--placeholder" style={{ animationDelay: delayAnimation }}>
      <div className="details-page__poster-wrapper">
        <div className="details-page__poster details-page__poster--placeholder" />
      </div>

      <div className="details-page__info">
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>

        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
        <div className="details-page__info-row details-page__info-row--placeholder">
          <div className="details-page__info-value details-page__info-value--placeholder" />
        </div>
      </div>
    </div>
  )
}

export default PlaceholderLoadingFullInfo
