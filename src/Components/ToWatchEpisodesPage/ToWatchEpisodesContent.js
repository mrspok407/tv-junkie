import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"

class ToWatchEpisodesContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initialLoading: true
    }
  }

  componentDidMount() {
    this.getContent({})
  }

  getContent = ({ sortBy = "first_air_date", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userShows(this.props.authUser.uid, database)
      .orderByChild(sortBy)
      // .limitToFirst(3)
      .once("value", snapshot => {
        let userShows = []
        snapshot.forEach(item => {
          userShows = [
            ...userShows,
            {
              id: item.val().id,
              name: item.val().name,
              status: item.val().status,
              timeStamp: item.val().timeStamp,
              episodes: item.val().episodes
            }
          ]
        })

        Promise.all(
          userShows.map(item => {
            const allShowsListSubDatabase =
              item.status === "Ended" || item.status === "Canceled" ? "ended" : "ongoing"

            return this.props.firebase
              .showInDatabase(allShowsListSubDatabase, item.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          console.log(userShows)
          console.log(showsData)

          const test = []

          showsData.forEach(show => {
            let allEpisodes = []

            show.episodes.forEach((season, indexSeason) => {
              let episodes = []

              season.episodes.forEach((episode, indexEpisode) => {
                const updatedEpisode = {
                  ...episode,
                  watched: userShows.find(item => item.id === show.id).episodes[indexSeason].episodes[
                    indexEpisode
                  ].watched
                }
                episodes.push(updatedEpisode)
              })

              const updatedSeason = {
                ...season,
                episodes
              }

              allEpisodes.push(updatedSeason)
            })

            test.push({
              ...show,
              episodes: allEpisodes
            })
          })

          console.log(test)
        })
      })
  }

  render() {
    return <div></div>
  }
}

export default withUserContent(ToWatchEpisodesContent)
