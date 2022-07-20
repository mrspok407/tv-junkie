import classNames from 'classnames'
import UserRating from 'Components/UI/UserRating/UserRating'
import React from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, currentDate } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import { useAppSelector } from 'app/hooks'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import Loader from 'Components/UI/Placeholders/Loader'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import { FetchSeasonsInt } from '../Hooks/UseFetchSeasons/ReducerConfig/@Types'
import { ShowEpisodesFromAPIInt } from '../@Types'
import SeasonEpisodes from './SeasonEpisodes/SeasonEpisodes'
import UserRatingSeason from './SeasonEpisodes/Components/UserRatingSeason'

type Props = {
  showId: number
  showCheckboxes: boolean
  seasonsTMDB: SeasonTMDB[]
  gridState: FetchSeasonsInt<ShowEpisodesFromAPIInt>
  handleOpenSeasonEpisodes: (seasonId: number, seasonNum: number) => void
}

const SeasonsGrid: React.FC<Props> = ({ showId, seasonsTMDB, gridState, showCheckboxes, handleOpenSeasonEpisodes }) => {
  const { data, loadingData, openData, errors } = gridState

  console.log({ seasonsTMDB })
  const renderEdgeCases = (season: SeasonTMDB) => {
    return season.season_number === 0 || season.name === 'Specials' || season.episode_count === 0 || !season.id
  }

  const renderEpisodes = (season: SeasonTMDB, daysToNewSeason: number) => {
    const seasonEpisodes = data.find((item) => item.seasonId === season.id)
    const isSeasonAired = daysToNewSeason <= 0

    const seasonData = {
      ...season,
      episodes: seasonEpisodes?.episodes || [],
      showTitle: seasonEpisodes?.showTitle || '',
    }

    if (isArrayIncludes(season.id, loadingData)) {
      return <Loader className="loader--small-pink" />
    }

    if (isArrayIncludes(season.id, openData)) {
      return (
        <>
          {seasonData.poster_path && (
            <div className="episodes__episode-group-poster-wrapper">
              {isSeasonAired && (
                <UserRatingSeason showRating={showCheckboxes} seasonNum={seasonData.season_number} showId={showId} />
              )}

              <div
                className="episodes__episode-group-poster"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${seasonData.poster_path})`,
                }}
              />
              {showCheckboxes && isSeasonAired && (
                <div className="episodes__episode-group-check-all-episodes">
                  <button
                    type="button"
                    className="button"
                    // onClick={() => checkEverySeasonEpisode(season.season_number)}
                  >
                    Check all
                  </button>
                </div>
              )}
            </div>
          )}
          <SeasonEpisodes seasonData={seasonData} showCheckboxes={showCheckboxes} showId={showId} />
        </>
      )
    }
  }

  return (
    <div className="episodes">
      {seasonsTMDB.map((season) => {
        if (renderEdgeCases(season)) return null

        const daysToNewSeason = differenceInCalendarDays(new Date(season.air_date!), currentDate)
        const isSeasonAired = daysToNewSeason <= 0
        return (
          <div
            key={season.id}
            className={classNames('episodes__episode-group', {
              'episodes__episode-group--no-poster': !season.poster_path,
            })}
            style={!isArrayIncludes(season.id, loadingData) ? { rowGap: '10px' } : { rowGap: '0px' }}
          >
            <div
              className={classNames('episodes__episode-group-info', {
                'episodes__episode-group-info--open': isArrayIncludes(season.id, openData),
                'episodes__episode-group-info--error': isArrayIncludes(season.id, errors),
                'episodes__episode-group-info--not-aired': !isSeasonAired,
              })}
              onClick={() => handleOpenSeasonEpisodes(season.id, season.season_number)}
            >
              <div className="episodes__episode-group-name">Season {season.season_number}</div>

              {isArrayIncludes(season.id, errors) ? (
                <div className="episodes__episode-group-days-to-air">Weird error occured wow</div>
              ) : (
                !isSeasonAired && (
                  <div className="episodes__episode-group-days-to-air">
                    {daysToNewSeason === 1 ? `${daysToNewSeason} day to air` : `${daysToNewSeason} days to air`}
                  </div>
                )
              )}
              <div className="episodes__episode-group-date">{season.air_date?.slice(0, 4)}</div>
            </div>

            {renderEpisodes(season, daysToNewSeason)}
          </div>
        )
      })}
    </div>
  )
}

export default SeasonsGrid
