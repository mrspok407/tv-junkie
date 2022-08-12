import React from 'react'
import classNames from 'classnames'
import { isArrayIncludes, currentDate } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import Loader from 'Components/UI/Placeholders/Loader'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import { FetchSeasonsInt } from '../Hooks/UseFetchSeasons/ReducerConfig/@Types'
import { ShowEpisodesFromAPIInt } from '../@Types'
import Season from './SeasonEpisodes/Season'

type Props = {
  showId: number
  showCheckboxes: boolean
  seasonsTMDB: SeasonTMDB[]
  seasonsData: FetchSeasonsInt<ShowEpisodesFromAPIInt>
  handleOpenSeasonEpisodes: (seasonId: number, seasonNum: number) => void
}

const SeasonsGrid: React.FC<Props> = ({
  showId,
  seasonsTMDB,
  seasonsData,
  showCheckboxes,
  handleOpenSeasonEpisodes,
}) => {
  const { data, loadingData, openData, errors } = seasonsData

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
        <Season seasonData={seasonData} showCheckboxes={showCheckboxes} showId={showId} isSeasonAired={isSeasonAired} />
      )
    }
  }

  const renderEdgeCases = (season: SeasonTMDB) => {
    return season.season_number === 0 || season.name === 'Specials' || season.episode_count === 0 || !season.id
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
                <div className="episodes__episode-group-days-to-air">Weird error occurred wow</div>
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
