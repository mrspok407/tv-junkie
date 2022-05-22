import React from 'react'
import './PlaceholderLoadingContentResultsItem.scss'

export default function ({ delayAnimation }) {
  return (
    <div className="content-results__item--placeholder" style={{ animationDelay: delayAnimation }}>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
      <div className="content-results__item-row--placeholder">
        <div className="content-results__item-value--placeholder" />
      </div>
    </div>
  )
}
