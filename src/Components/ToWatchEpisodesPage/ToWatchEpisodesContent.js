import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import ShowsEpisodes from "Components/Templates/FullContentInfo/Components/ShowsEpisodes/ShowsEpisodes"
import { todayDate } from "Utils"

class ToWatchEpisodesContent extends Component {
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

  componentWillUnmount() {
    this.props.firebase.userShows(this.props.authUser.uid, "watchingShows").off()
  }

  getContent = ({ sortBy = "first_air_date", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userShows(this.props.authUser.uid, database)
      .orderByChild(sortBy)
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

          this.props.firebase
            .userShow(this.props.authUser.uid, item.val().id, database)
            .on("value", snapshot => {
              if (snapshot.val() !== null) {
                console.log(this.state.watchingShows)
                const index = this.state.watchingShows.findIndex(item => item.id === snapshot.val().id)
                console.log(index)
                const watchingShows = this.state.watchingShows.filter(item => item.id !== snapshot.val().id)
                const show = this.state.watchingShows.find(item => item.id === snapshot.val().id)

                if (show) {
                  show.episodes = snapshot.val().episodes
                  watchingShows.splice(index, 0, show)

                  this.setState({
                    watchingShows: watchingShows
                  })
                }
              }
            })
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
          const updatedShows = []

          showsData.forEach(show => {
            let allEpisodes = []

            show.episodes.forEach((season, indexSeason) => {
              let episodes = []

              season.episodes.forEach((episode, indexEpisode) => {
                const seasonPath = userShows.find(item => item.id === show.id).episodes[indexSeason]

                const watched =
                  seasonPath && seasonPath.episodes[indexEpisode]
                    ? seasonPath.episodes[indexEpisode].watched
                    : false

                const updatedEpisode = {
                  ...episode,
                  watched: watched
                }
                episodes.push(updatedEpisode)
              })

              const updatedSeason = {
                ...season,
                episodes
              }

              allEpisodes.push(updatedSeason)
            })

            updatedShows.push({
              ...show,
              episodes: allEpisodes
            })

            this.props.firebase
              .userShowAllEpisodes(this.props.authUser.uid, show.id, database)
              .set(allEpisodes)
          })

          this.setState({
            watchingShows: updatedShows.reverse(),
            initialLoading: false
          })

          // console.log(updatedShows.reverse())
        })
      })
  }

  render() {
    console.log(this.state.watchingShows)

    return (
      <div className="content-results">
        {this.state.watchingShows.map((show, index) => {
          console.log(show)
          const showInDatabase = show && {
            database: "watchingShows",
            info: {
              ...show.info,
              episodes: show.episodes
            }
          }

          const infoToPass = show && {
            id: show.info.id,
            status: show.info.status
          }

          return (
            <div key={show.id} className="towatch__show">
              <div className="towatch__show-name">{show.info.name}</div>
              <ShowsEpisodes
                seasonsArr={show.episodes}
                showTitle={show.info.name || show.info.original_name}
                todayDate={todayDate}
                id={show.id}
                showInDatabase={showInDatabase}
                infoToPass={infoToPass}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default withUserContent(ToWatchEpisodesContent)
