import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import UserRating from 'Components/UI/UserRating/UserRating'
import React, { useState, useEffect } from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, todayDate } from 'Utils'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import useFormatEpisodeAirDate from '../../../../Hooks/UseFormatEpisodeAirDate'
import TorrentLinksEpisodes from '../TorrentLinksEpisodes/TorrentLinksEpisodes'
import UserRatingEpisode from './Components/UserRatingEpisode'

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

  const [episodeAirDate, episodeAirDateAsDateObj] = useFormatEpisodeAirDate({ episodeData })

  const daysToNewEpisode = differenceInCalendarDays(new Date(episodeData.air_date), todayDate)

  return (
    <div
      // ref={episodeRef}
      className={classNames('episodes__episode', {
        // 'episodes__episode--open': detailEpisodeInfo.includes(episode.id),
        'episodes__episode--open': isEpisodeOpen,
      })}
    >
      <div
        className="episodes__episode-wrapper"
        onClick={() => setIsEpisodeOpen(!isEpisodeOpen)}
        // onClick={() => parentComponent === 'detailesPage' && showEpisodeInfo(episode.id as number)}
        // onClick={() =>
        //   setOpenEpisodes(
        //     isArrayIncludes(episode.id, openEpisodes)
        //       ? openEpisodes.filter((item) => item !== episode.id)
        //       : [...openEpisodes, episode.id],
        //   )
        // }
        style={
          daysToNewEpisode > 0 || !episodeData.air_date
            ? {
                backgroundColor: 'rgba(132, 90, 90, 0.3)',
              }
            : {
                backgroundColor: '#1d1d1d96',
              }
        }
      >
        <div className="episodes__episode-date">{episodeAirDate}</div>
        <div className="episodes__episode-name">
          <span className="episodes__episode-number">{episodeData.episode_number}.</span>
          {episodeData.name}
        </div>
        {daysToNewEpisode > 0 ? (
          <div className="episodes__episode-days-to-air">
            {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
          </div>
        ) : (
          episodeAirDateAsDateObj?.getTime() < todayDate.getTime() &&
          episodeData.air_date &&
          authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
            <TorrentLinksEpisodes
              showTitle={showTitle}
              seasonNumber={seasonNumber}
              episodeNumber={episodeData.episode_number as number}
            />
          )
        )}
      </div>

      {daysToNewEpisode <= 0 && episodeData.air_date && (
        <div
          // ref={checkboxRef}
          className="episodes__episode-checkbox"
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
          {/* {disableCheckboxWarning === episode.id && (
            <div ref={registerWarningRef} className="buttons__col-warning">
              To use full features please{' '}
              <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                register
              </Link>
              . Your allready selected shows will be saved.
            </div>
          )} */}
        </div>
      )}

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

          {episodeAirDateAsDateObj.getTime() < todayDate.getTime() && episodeData.air_date && (
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
