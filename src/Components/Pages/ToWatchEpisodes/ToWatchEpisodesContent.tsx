import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ShowsEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes'
import { todayDate, combineMergeObjects, releasedEpisodesToOneArray } from 'Utils'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoToWatchEpisodes from 'Components/UI/Placeholders/PlaceholderNoToWatchEpisodes'
import merge from 'deepmerge'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@Types'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'

const ToWatchEpisodesContent: React.FC = () => {
  const [watchingShows, setWatchingShows] = useState<UserShowsInterface[]>([])
  const [loading, setLoading] = useState(true)

  const context = useContext(AppContext)

  const getContent = useCallback(() => {
    const watchingShows = context.userContent.userShows.filter(
      (show) => show.database === 'watchingShows' && !show.allEpisodesWatched,
    )
    const toWatchEpisodes: any = context.userContent.userToWatchShows

    if (toWatchEpisodes.length === 0) {
      setWatchingShows([])
      setLoading(false)
      return
    }

    const watchingShowsModified = watchingShows
      .reduce((acc: UserShowsInterface[], show) => {
        const showToWatch = toWatchEpisodes.find((item: any) => item.id === show.id)
        if (showToWatch) {
          const showMerged = merge(show, showToWatch, {
            arrayMerge: combineMergeObjects,
          })
          acc.push(showMerged)
        }
        return acc
      }, [])
      .sort((a, b) => (a.first_air_date > b.first_air_date ? -1 : 1))

    setWatchingShows(watchingShowsModified)
    setLoading(false)
  }, [context.userContent])

  useEffect(() => {
    getContent()
  }, [getContent])

  return (
    <div className="content-results content-results--to-watch-page">
      {context.userContent.loadingShows || context.userContent.loadingNotFinishedShows ? (
        <Loader className="loader--pink" />
      ) : watchingShows.length === 0 && !loading ? (
        <PlaceholderNoToWatchEpisodes />
      ) : (
        <>
          {watchingShows.map((show) => {
            const toWatchEpisodes = show.episodes.reduce((acc: EpisodesFromFireDatabase[], season) => {
              const seasonEpisodes = season.episodes.reduce((acc: SingleEpisodeFromFireDatabase[], episode, index) => {
                if (episode.air_date && new Date(episode.air_date).getTime() < todayDate.getTime()) {
                  acc.push({ ...episode, index })
                }
                return acc
              }, [])

              seasonEpisodes.reverse()

              if (seasonEpisodes.length !== 0 && seasonEpisodes.some((item) => !item.watched)) {
                acc.push({ ...season, episodes: seasonEpisodes })
              }

              return acc
            }, [])
            toWatchEpisodes.reverse()

            const releasedEpisodes: SingleEpisodeFromFireDatabase[] = releasedEpisodesToOneArray({
              data: show.episodes,
            })

            return (
              <div key={show.id} className="towatch__show">
                <Link className="towatch__show-name" to={`/show/${show.id}`}>
                  {show.name}
                </Link>
                <ShowsEpisodes
                  parentComponent="toWatchPage"
                  episodesData={toWatchEpisodes}
                  showTitle={show.name || show.original_name}
                  id={show.id}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default ToWatchEpisodesContent
