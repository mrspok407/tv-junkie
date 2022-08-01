import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import UserRating from 'Components/UI/UserRating/UserRating'
import React, { useState } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import useFormatEpisodeAirDate from '../../../../Hooks/UseFormatEpisodeAirDate'
import TorrentLinksEpisodes from '../TorrentLinksEpisodes/TorrentLinksEpisodes'
import UserRatingEpisode from './Components/UserRatingEpisode'
import useDisableWarning from './Hooks/UseDisableWarning'
import EpisodeCheckbox from './Components/EpisodeCheckbox/EpisodeCheckbox'

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

  console.log({ episodeData })

  return (
    <div
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
          <EpisodeCheckbox isDisabled={!showCheckboxes || !authUser?.uid} episodeData={episodeData} showId={showId} />
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
