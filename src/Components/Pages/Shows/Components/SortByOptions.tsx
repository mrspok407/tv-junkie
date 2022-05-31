import classNames from 'classnames'
import React from 'react'

type Props = {
  sortBy: string
  handleSortBy: (sortBy: string) => void
}

const SortByOptions: React.FC<Props> = ({ sortBy, handleSortBy }) => {
  return (
    <>
      <div className="content-results__sortby">
        <div className="content-results__sortby-text">Sort by:</div>
        <div className="content-results__sortby-buttons">
          <div
            className={classNames('content-results__sortby-buttons', {
              'content-results__sortby-button--active': sortBy === 'name',
            })}
          >
            <button type="button" className="button button--sortby-shows" onClick={() => handleSortBy('name')}>
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
      </div>
    </>
  )
}

export default SortByOptions
