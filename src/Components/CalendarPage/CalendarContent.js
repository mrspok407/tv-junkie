import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoToWatchEpisodes from "Components/Placeholders/PlaceholderNoToWatchEpisodes"
import merge from "deepmerge"

class CalendarContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      watchingShows: [],
      initialLoading: true
    }
  }

  componentDidMount() {
    this.getContent({})
  }

  getContent = ({ sortBy = "id", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userShows(this.props.authUser.uid, database)
      .orderByChild(sortBy)
      .once("value", snapshot => {
        let userShows = []

        snapshot.forEach(show => {
          if (show.val().status === "ended") return

          userShows.push({
            id: show.val().id,
            status: show.val().status
          })
        })

        Promise.all(
          userShows.map(show => {
            return this.props.firebase
              .showInDatabase(show.status, show.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          console.log(userShows)
          console.log(showsData)

          const allEpisodes = showsData.reduce((acc, show) => {
            const showEpisodes = show.episodes.reduce((acc, season) => {
              const toAirEpisodes = season.episodes.reduce((acc, episode) => {
                if (differenceBtwDatesInDays(episode.air_date, todayDate) > 0) {
                  acc.push({ ...episode, name: show.info.name || show.info.original_name })
                }
                return acc
              }, [])

              return [...acc, ...toAirEpisodes]
            }, [])

            return [...acc, ...showEpisodes]
          }, [])

          const sortedEpisodes = allEpisodes.sort((a, b) => (a.air_date > b.air_date ? 1 : -1))
          const uniqueMonths = sortedEpisodes
            .map(episode => episode.air_date.slice(0, 7))
            .filter((month, index, array) => array.indexOf(month) === index)

          console.log(sortedEpisodes)
          console.log(uniqueMonths)

          const episodesWithMonths = uniqueMonths.reduce((acc, month) => {
            const episodes = sortedEpisodes.reduce((acc, episode) => {
              if (episode.air_date.slice(0, 7) === month) acc.push(episode)
              return acc
            }, [])

            acc.push({ month, episodes })

            return acc
          }, [])

          //   let episodesWithMonths = []

          //   uniqueMonths.forEach(month => {
          //     const episodes = []
          //     sortedEpisodes.forEach(episode => {
          //       if (episode.air_date.slice(0, 7) === month) {
          //         episodes.push(episode)
          //       }
          //     })
          //     episodesWithMonths.push({ month, episodes })
          //   })

          console.log(episodesWithMonths)

          //   sortedEpisodes.forEach(episode => {
          //     const months = {}
          //   })
        })
      })
  }

  render() {
    return <></>
  }
}

export default withUserContent(CalendarContent)
