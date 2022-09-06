import React, { useState } from 'react'
import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { postCheckSingleEpisode } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { useAppDispatch } from 'app/hooks'
import useFormatContentDate from '../../../../Hooks/UseFormatEpisodeAirDate'
import TorrentLinksEpisodes from '../TorrentLinksEpisodes/TorrentLinksEpisodes'
import EpisodeCheckbox from './Components/EpisodeCheckbox/EpisodeCheckbox'
import UserRatingEpisode from './Components/UserRatingEpisode'

type Props = {
  episodeData: SingleEpisodeFromFireDatabase
  showCheckboxes: boolean
  showId: number
  showTitle: string
}

const Episode: React.FC<Props> = ({ episodeData, showCheckboxes, showId, showTitle }) => {
  const { authUser, firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()
  const [isEpisodeOpen, setIsEpisodeOpen] = useState(false)

  const {
    dateReadableFormat,
    daysToRelease,
    isContentAired: isEpisodeReleased,
    isDateNotValid,
  } = useFormatContentDate({
    contentReleasedValue: episodeData.air_date,
    formatSettings: 'MMMM d, yyyy',
  })

  const handleEpisodeCheck = () => {
    dispatch(
      postCheckSingleEpisode({
        showId,
        seasonNumber: episodeData.originalSeasonIndex,
        episodeNumber: episodeData.originalEpisodeIndex,
        firebase,
      }),
    )
  }

  return (
    <div
      className={classNames('episodes__episode', {
        'episodes__episode--open': isEpisodeOpen,
      })}
    >
      <div
        className={classNames('episodes__episode-wrapper', {
          'episodes__episode-wrapper--not-aired': !isEpisodeReleased || isDateNotValid,
        })}
        onClick={() => setIsEpisodeOpen(!isEpisodeOpen)}
      >
        {/* {!(!isEpisodeReleased && !isDateNotValid) && ( */}
        {isEpisodeReleased && !isDateNotValid && (
          <EpisodeCheckbox
            isDisabled={!showCheckboxes || !authUser?.uid}
            episodeData={episodeData}
            showId={showId}
            handleEpisodeCheck={handleEpisodeCheck}
          />
        )}

        <div className="episodes__episode-date">{dateReadableFormat}</div>
        <div className="episodes__episode-name">
          <span className="episodes__episode-number">{episodeData.episode_number}.</span>
          {episodeData.name}
        </div>
        {!isEpisodeReleased && !isDateNotValid && (
          <div className="episodes__episode-days-to-air">
            {daysToRelease === 1 ? `${daysToRelease} day` : `${daysToRelease} days`}
          </div>
        )}
      </div>

      {isEpisodeOpen && (
        <div
          className={classNames('episodes__episode-details', {
            'episodes__episode-details--no-image': !episodeData.still_path,
          })}
        >
          {episodeData.still_path && (
            <div
              className="episodes__episode-details-image"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${episodeData.still_path})`,
              }}
            />
          )}
          {episodeData.overview && <div className="episodes__episode-details-overview">{episodeData.overview}</div>}

          {isEpisodeReleased && (
            <>
              <UserRatingEpisode showRating={showCheckboxes} episodeData={episodeData} showId={showId} />
              {(process.env.NODE_ENV !== 'production' ||
                [process.env.REACT_APP_TEST_EMAIL, process.env.REACT_APP_ADMIN_EMAIL].includes(authUser?.email)) && (
                <TorrentLinksEpisodes
                  showTitle={showTitle}
                  seasonNumber={episodeData.season_number}
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
