import classNames from 'classnames'
import React from 'react'
import { MovieSectionOptions, SortByOptionsType } from '../ReducerConfig/@Types'

type Props = {
  sortBy: SortByOptionsType
  handleSortBy: (sortBy: SortByOptionsType) => void
  handleHideFinished: React.Dispatch<React.SetStateAction<boolean>>
  section: MovieSectionOptions
}

const SortByOptions: React.FC<Props> = ({ sortBy, section, handleSortBy, handleHideFinished }) => {
  return (
    <>
      <div className="content-results__sortby content-results__sortby--movies-grid">
        <div className="content-results__sortby-text">Sort by:</div>
        <div className="content-results__sortby-buttons">
          <div
            className={classNames('content-results__sortby-buttons', {
              'content-results__sortby-button--active': sortBy === 'title',
            })}
          >
            <button type="button" className="button button--sortby-shows" onClick={() => handleSortBy('title')}>
              Alphabetically
            </button>
          </div>
          <div
            className={classNames('content-results__sortby-button', {
              'content-results__sortby-button--active': sortBy === 'timeStamp',
            })}
          >
            <button type="button" className="button button--sortby-shows" onClick={() => handleSortBy('timeStamp')}>
              Recently added
            </button>
          </div>
        </div>
        {section !== MovieSectionOptions.Finished && (
          <div className="content-results__hide-finished-movies">
            <button
              className="button"
              type="button"
              onClick={() => {
                handleHideFinished((prevState) => !prevState)
              }}
            >
              Toggle finished
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default SortByOptions
