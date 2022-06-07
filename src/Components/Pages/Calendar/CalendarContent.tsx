import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { differenceBtwDatesInDays, todayDate } from 'Utils'
import classNames from 'classnames'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoFutureEpisodes from 'Components/UI/Placeholders/PlaceholderNoFutureEpisodes'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import TorrentLinksEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/Components/TorrentLinksEpisodes'
import { useAppSelector } from 'app/hooks'
import {
  selectEpisodes,
  selectShows,
  selectShowsLoading,
} from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import {
  SingleEpisodeByMonthInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectAuthUser } from 'Components/UserAuth/Session/WithAuthentication/authUserSlice'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { organiseFutureEpisodesByMonth, organizeMonthEpisodesByEpisodeNumber } from './CalendarHelpers'

type Props = {
  homePage?: boolean
}

const CalendarContent: React.FC<Props> = ({ homePage }) => {
  const { authUser } = useAppSelector(selectAuthUser)
  const [openMonths, setOpenMonths] = useState<string[]>([])
  // const [willAirEpisodes, setWillAirEpisodes] = useState<UserWillAirEpisodesInterface[]>([])
  const context = useContext(AppContext)

  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const userShows = useAppSelectorArray<UserShowsInterface>(selectShows)
  const userEpisodes = useAppSelector(selectEpisodes)
  const watchingShows = userShows.filter((show) => show.database === 'watchingShows')
  // const watchingShowsEpisodes = watchingShows.reduce((acc, show) => {
  //   acc.push({...show, episodes: userEpisodes[show.id]})
  //   return acc
  // }, [])
  const willAirEpisodesData: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows, userEpisodes)
  const willAirEpisodes = homePage ? willAirEpisodesData.slice(0, 2) : willAirEpisodesData

  useEffect(() => {
    if (!Object.values(userEpisodes).length) return
    const willAirEpisodes = homePage ? willAirEpisodesData.slice(0, 2) : willAirEpisodesData
    const months = willAirEpisodes.map((item) => Object.values(item)[0])
    setOpenMonths(homePage ? [months[0]] : months)
  }, [userEpisodes, homePage]) // eslint-disable-line react-hooks/exhaustive-deps

  // const getContent = useCallback(() => {
  //   if (context.userContent.userShows.length === 0) {
  //     setLoading(false)
  //     return
  //   }

  //   const willAirEpisodes = homePage
  //     ? context.userContent.userWillAirEpisodes.slice(0, 2)
  //     : context.userContent.userWillAirEpisodes

  //   const months = willAirEpisodes.map((item: Object) => {
  //     return Object.values(item)[0]
  //   })

  //   setWillAirEpisodes(willAirEpisodes)
  //   setOpenMonths(homePage ? [months[0]] : months)
  //   setLoading(false)
  // }, [context.userContent, homePage])

  // useEffect(() => {
  //   getContent()
  // }, [getContent])

  const showMonthEpisodes = ({ month }: { month: string }) => {
    if (openMonths.includes(month)) {
      setOpenMonths(openMonths?.filter((item) => item !== month))
    } else {
      setOpenMonths((prevState) => [...prevState, month])
    }
  }

  if (showsInitialLoading || context.userContentHandler.loadingShowsOnRegister) {
    return (
      <div className="content-results content-results--calendar">
        <Loader className="loader--pink" />
      </div>
    )
  }

  return (
    <div className="content-results content-results--calendar">
      {willAirEpisodes.length === 0 && !homePage ? (
        <PlaceholderNoFutureEpisodes />
      ) : (
        <div className="episodes episodes--calendar">
          {willAirEpisodes.map((month) => {
            const date = new Date(month.month)
            const monthLongName = date.toLocaleString('en', { month: 'long' })

            const monthEpisodes: SingleEpisodeByMonthInterface[] = organizeMonthEpisodesByEpisodeNumber(month.episodes)

            return (
              <div key={month.month} className="episodes__episode-group">
                <div
                  className={classNames('episodes__episode-group-info', {
                    'episodes__episode-group-info--open': openMonths.includes(month.month),
                  })}
                  onClick={() => showMonthEpisodes({ month: month.month })}
                >
                  <div className="episodes__episode-group-name">
                    {todayDate.getFullYear() !== date.getFullYear() ? (
                      <>
                        {monthLongName}
                        <span>{date.getFullYear()}</span>
                      </>
                    ) : (
                      monthLongName
                    )}
                  </div>
                  <div className="episodes__episode-group-episodes-left">
                    {month.episodes.length}
                    {month.episodes.length > 1 ? 'episodes' : 'episode'}
                  </div>
                </div>

                <div className="episodes__episode-list">
                  {openMonths.includes(month.month) && (
                    <>
                      {monthEpisodes.map((episode: any, episodeIndex: number, array: any[]) => {
                        const prevEpisode = array[episodeIndex - 1]
                        const prevEpisodeAirDate = prevEpisode?.air_date

                        // Format Date //
                        const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

                        const options: any = {
                          weekday: 'short',
                          day: 'numeric',
                        }

                        const formatedDate = new Date(airDateISO)

                        const episodeAirDate = episode.air_date
                          ? new Intl.DateTimeFormat('en-US', options).format(formatedDate).split(' ').join(', ')
                          : 'No date available'
                        // Format Date End //

                        // Format Seasons And Episode Numbers //
                        const seasonToString = episode.season_number.toString()
                        const episodeToString = episode.episode_number.toString()

                        const seasonNumber =
                          seasonToString.length === 1 ? 's'.concat(seasonToString) : 's'.concat(seasonToString)
                        const episodeNumber =
                          episodeToString.length === 1 ? 'e0'.concat(episodeToString) : 'e'.concat(episodeToString)
                        // Format Seasons And Episode Numbers End //

                        const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
                        const willAirToday = daysToNewEpisode === 0

                        const handleDaysToNewEpisode = () => {
                          if (daysToNewEpisode > 1) {
                            return `${daysToNewEpisode} days`
                          }
                          if (daysToNewEpisode === 1) {
                            return '1 day'
                          }
                          if (willAirToday) {
                            return 'Today'
                          }
                        }

                        return (
                          <div
                            key={episode.id}
                            className={classNames('episodes__episode', {
                              'episodes__episode--today': willAirToday,
                              'episodes__episode--today-admin':
                                authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && willAirToday,
                            })}
                          >
                            <div className="episodes__episode-wrapper">
                              <div className="episodes__episode-date">
                                {episode.air_date !== prevEpisodeAirDate && episodeAirDate}
                              </div>
                              <div className="episodes__episode-wrapper--calendar">
                                <div className="episodes__episode-show-name">
                                  <Link to={`/show/${episode.showId}`}>{episode.show}</Link>
                                </div>
                                <div className="episodes__episode-episode-number">
                                  {seasonNumber}
                                  {episodeNumber}
                                </div>
                                <div className="episodes__episode-episode-title">{episode.name}</div>
                              </div>

                              {daysToNewEpisode >= 0 && (
                                <div className="episodes__episode-days-to-air">
                                  {willAirToday && authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
                                    <TorrentLinksEpisodes
                                      showTitle={episode.show}
                                      seasonNumber={episode.season_number}
                                      episodeNumber={episode.episode_number}
                                    />
                                  )}
                                  <span>{handleDaysToNewEpisode()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CalendarContent
