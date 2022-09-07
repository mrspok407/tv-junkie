import React from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatMovieBudget } from 'Utils/FormatTMDBAPIData'
import { CONTENT_INFO_NO_DATA } from 'Utils/Constants'
import WatchingStatusButtons from './Buttons/WatchingStatusButtons/WatchingStatusButtons'
import MovieButtons from './Buttons/MovieButtons/MovieButtons'
import UserRatingWrapper from './UserRatingWrapper'
import UsersWatching from './UsersWatching'
import useFormatDetailsValues from './Hooks/UseFormatDetailsValues'

type Props = {
  details: MainDataTMDB
  showId: number
}

export const MainInfo: React.FC<Props> = ({ details, showId }) => {
  const isMediaTypeTV = details.mediaType === 'show'
  console.log({ isMediaTypeTV })

  const { companyName, genres, title, yearRelease, yearRange, runtime } = useFormatDetailsValues({
    details,
    isMediaTypeTV,
  })

  const noDataPlaceholder = () => <span className="details-page__info-no-info">{CONTENT_INFO_NO_DATA}</span>

  return (
    <div className="details-page__info">
      <div className="details-page__info-title">
        {title}
        {isMediaTypeTV && <span>{yearRelease ? ` (${yearRange})` : ''}</span>}
      </div>
      <div className="details-page__info-row">
        <div className="details-page__info-option">Year</div>
        <div className="details-page__info-value">{yearRelease || noDataPlaceholder()}</div>
      </div>
      {details.status !== 'Released' && (
        <div className="details-page__info-row">
          <div className="details-page__info-option">Status</div>
          <div className="details-page__info-value">{details.status || noDataPlaceholder()}</div>
        </div>
      )}

      <div className="details-page__info-row">
        <div className="details-page__info-option">Genres</div>
        <div className="details-page__info-value">{genres || noDataPlaceholder()}</div>
      </div>
      <div className="details-page__info-row">
        <div className="details-page__info-option">Company</div>
        <div className="details-page__info-value">{companyName || noDataPlaceholder()}</div>
      </div>
      <div className="details-page__info-row">
        <div className="details-page__info-option">Users rating</div>
        <div className="details-page__info-value">{details.vote_average?.toFixed(1) || noDataPlaceholder()}</div>
      </div>

      {isMediaTypeTV && <UsersWatching showId={showId} />}

      <div className="details-page__info-row">
        <div className="details-page__info-option">Runtime</div>
        <div className="details-page__info-value">{runtime ? `${runtime} min` : noDataPlaceholder()}</div>
      </div>

      {!isMediaTypeTV && (
        <>
          <div className="details-page__info-row">
            <div className="details-page__info-option">Tagline</div>
            <div className="details-page__info-value">{details.tagline || noDataPlaceholder()}</div>
          </div>
          <div className="details-page__info-row">
            <div className="details-page__info-option">Budget</div>
            <div className="details-page__info-value">{formatMovieBudget(details.budget) ?? noDataPlaceholder()}</div>
          </div>
          <div className="details-page__info-row">
            <div className="details-page__info-option">External links</div>
            <div className="details-page__info-value">
              <a
                href={`https://www.imdb.com/title/${details.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="details-page__info-imdb"
              />
            </div>
          </div>
        </>
      )}

      <div className="details-page__info-row">
        <div className="details-page__info-option">My rating</div>
        <UserRatingWrapper contentId={showId} isMediaTypeTV={isMediaTypeTV} />
      </div>

      <div className="details-page__info-row details-page__info--button">
        {isMediaTypeTV && <WatchingStatusButtons showId={showId} details={details} />}
        {!isMediaTypeTV && <MovieButtons movieId={showId} details={details} />}
      </div>
    </div>
  )
}

export default MainInfo
