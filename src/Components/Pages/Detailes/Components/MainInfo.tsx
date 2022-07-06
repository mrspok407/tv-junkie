import React from 'react'
import classNames from 'classnames'
import UserRating from 'Components/UI/UserRating/UserRating'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { formatMovieBudget } from 'Utils/FormatTMDBAPIData'
import { CONTENT_INFO_NO_DATA } from 'Utils/Constants'
import ShowsButtonsRed from './ShowsButtonsRed'
import useFormatDetailesValues from './Hooks/useFormatDetailesValues'
import MovieButtons from './MovieButtons'

type Props = {
  detailes: MainDataTMDB
  mediaType: string
  id: number
}

export const MainInfo: React.FC<Props> = ({ detailes, mediaType, id }) => {
  const { authUser } = useFrequentVariables()
  const isMediaTypeTV = mediaType === 'show'

  const { companyName, genres, title, yearRelease, yearRange, runtime } = useFormatDetailesValues({
    detailes,
    isMediaTypeTV,
  })

  const noDataPlaceholder = () => <span className="detailes-page__info-no-info">{CONTENT_INFO_NO_DATA}</span>

  return (
    <div className="detailes-page__info">
      <div className="detailes-page__info-title">
        {title}
        {isMediaTypeTV && <span>{yearRelease ? ` (${yearRange})` : ''}</span>}
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Year</div>
        <div className="detailes-page__info-value">{yearRelease || noDataPlaceholder()}</div>
      </div>
      {detailes.status !== 'Released' && (
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Status</div>
          <div className="detailes-page__info-value">{detailes.status || noDataPlaceholder()}</div>
        </div>
      )}

      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Genres</div>
        <div className="detailes-page__info-value">{genres || noDataPlaceholder()}</div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Company</div>
        <div className="detailes-page__info-value">{companyName || noDataPlaceholder()}</div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Users rating</div>
        <div className="detailes-page__info-value">{detailes.vote_average || noDataPlaceholder()}</div>
      </div>
      <div className="detailes-page__info-row">
        <div className="detailes-page__info-option">Runtime</div>
        <div className="detailes-page__info-value">{runtime ? `${runtime} min` : noDataPlaceholder()}</div>
      </div>

      {isMediaTypeTV && (
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">My rating</div>
          <div className="detailes-page__info-value">
            <UserRating id={id} firebaseRef="userShow" showRating mediaType={mediaType} />
          </div>
        </div>
      )}

      {!isMediaTypeTV && (
        <>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">Tagline</div>
            <div className="detailes-page__info-value">{detailes.tagline || noDataPlaceholder()}</div>
          </div>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">Budget</div>
            <div className="detailes-page__info-value">{formatMovieBudget(detailes.budget) ?? noDataPlaceholder()}</div>
          </div>
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">External links</div>
            <div className="detailes-page__info-value">
              <a
                href={`https://www.imdb.com/title/${detailes.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="detailes-page__info-imdb"
              />
            </div>
          </div>
        </>
      )}

      <div className="detailes-page__info-row detailes-page__info--button">
        {isMediaTypeTV && <ShowsButtonsRed id={id} detailes={detailes} />}
        {!isMediaTypeTV && <MovieButtons id={id} detailes={detailes} />}
      </div>
    </div>
  )
}

export default MainInfo
