import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import UserRating from 'Components/UI/UserRating/UserRating'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, currentDate } from 'Utils'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import useFormatEpisodeAirDate from '../../../../Hooks/UseFormatEpisodeAirDate'
import TorrentLinksEpisodes from '../TorrentLinksEpisodes/TorrentLinksEpisodes'
import UserRatingEpisode from './Components/UserRatingEpisode'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import { Link } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import useDisableWarning from './Components/UseDisableWarning'

type Props = {
  episodeData: SingleEpisodeFromFireDatabase
  episodeNumberForFirebase: number
  seasonNumber: number
  showTitle: string
  showCheckboxes: boolean
  showId: number
}

const Episode: React.FC<Props> = ({
  episodeData,
  episodeNumberForFirebase,
  seasonNumber,
  showTitle,
  showCheckboxes,
  showId,
}) => {
  const { authUser } = useFrequentVariables()
  const [isEpisodeOpen, setIsEpisodeOpen] = useState(false)

  const [airDateReadable, daysToNewEpisode, isEpisodeAired, airDateUnavailable] = useFormatEpisodeAirDate({
    episodeData,
  })

  const [checkboxDisableWarning, showDisableWarning, fadeOutStart, checkboxRef] = useDisableWarning()

  // const [checkboxDisableWarning, setCheckboxDisableWarning] = useState(false)
  // const checkboxRef = useRef<HTMLDivElement>(null)

  // const showDisableWarning = (e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   setCheckboxDisableWarning(true)
  // }

  // const handleClickOutside = useCallback(() => {
  //   setCheckboxDisableWarning(false)
  // }, [])
  // useClickOutside({ ref: checkboxRef, callback: handleClickOutside })

  return (
    <div
      // ref={episodeRef}
      className={classNames('episodes__episode', {
        'episodes__episode--open': isEpisodeOpen,
      })}
    >
      <div
        className={classNames('episodes__episode-wrapper', {
          'episodes__episode-wrapper--not-aired': !isEpisodeAired,
        })}
        onClick={() => setIsEpisodeOpen(!isEpisodeOpen)}
        style={
          !isEpisodeAired || airDateUnavailable
            ? {
                backgroundColor: 'rgba(132, 90, 90, 0.3)',
              }
            : {
                backgroundColor: '#1d1d1d96',
              }
        }
      >
        {isEpisodeAired && !airDateUnavailable && (
          <div
            ref={checkboxRef}
            className="episodes__episode-checkbox"
            onClick={showDisableWarning}

            // onClick={() => showDissableCheckboxWarning(episode.id as number)}
          >
            <label>
              <input
                type="checkbox"
                // checked={_get(showSeason, `episodes.${indexOfEpisode}.watched`, false)}
                // checked={*data from store*}
                onChange={() => {
                  // toggleWatchedEpisode(season.season_number, indexOfEpisode)
                }}
                disabled={!showCheckboxes || !authUser?.uid}
              />
              <span
                className={classNames('custom-checkmark', {
                  'custom-checkmark--disabled': !showCheckboxes || !authUser?.uid,
                })}
              />
            </label>
            {checkboxDisableWarning && (
              <div
                className={classNames('buttons__col-warning', {
                  'buttons__col-warning--fade-out': fadeOutStart,
                })}
              >
                To use full features please{' '}
                <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                  register
                </Link>
                . Your allready selected shows will be saved.
              </div>
            )}
          </div>
        )}

        <div className="episodes__episode-date">{airDateReadable}</div>
        <div className="episodes__episode-name">
          <span className="episodes__episode-number">{episodeData.episode_number}.</span>
          {episodeData.name}
        </div>
        {!isEpisodeAired && (
          <div className="episodes__episode-days-to-air">
            {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
          </div>
        )}
      </div>

      {/* {detailEpisodeInfo.includes(episode.id) && ( */}
      {isEpisodeOpen && (
        <div
          className={classNames('episodes__episode-detailes', {
            'episodes__episode-detailes--no-image': !episodeData.still_path,
          })}
        >
          {episodeData.still_path && (
            <div
              className="episodes__episode-detailes-image"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${episodeData.still_path})`,
              }}
            />
          )}
          {episodeData.overview && <div className="episodes__episode-detailes-overview">{episodeData.overview}</div>}

          {isEpisodeAired && !airDateUnavailable && (
            <>
              <UserRatingEpisode
                showRating={showCheckboxes}
                seasonNum={seasonNumber}
                episodeNum={episodeNumberForFirebase}
                showId={showId}
              />
              {authUser?.email !== process.env.REACT_APP_ADMIN_EMAIL && (
                <TorrentLinksEpisodes
                  showTitle={showTitle}
                  seasonNumber={seasonNumber}
                  episodeNumber={episodeData.episode_number as number}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Episode
