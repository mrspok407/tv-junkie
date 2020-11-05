import React, { Component } from "react"
import { compose } from "recompose"
import { Helmet } from "react-helmet"
import * as _get from "lodash.get"
import axios from "axios"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import Header from "Components/UI/Header/Header"
import Footer from "Components/UI/Footer/Footer"
import userContentHandler from "Components/UserContent/UseContentHandler"
import { todayDate } from "Utils"
import "./Profile.scss"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      verificationSent: false,
      authUser: null
    }
  }

  componentDidMount() {
    this.authUserListener()
  }

  sendEmailVerification = () => {
    this.props.firebase.sendEmailVerification()
    this.setState({ verificationSent: true })
  }

  authUserListener = () => {
    this.props.firebase.onAuthUserListener(
      (authUser) => {
        this.setState({ authUser })
      },
      () => {
        this.setState({ authUser: null })
      }
    )
  }

  // test = () => {
  //   this.props.firebase.users().once("value", (snapshot) => {
  //     Object.entries(snapshot.val()).forEach(([key, value]) => {
  //       this.props.firebase
  //         .userEpisodes(key)
  //         .child("all")
  //         .once("value", (snapshot) => {
  //           if (snapshot.val() === null) return
  //           this.props.firebase.userEpisodes(key).set(snapshot.val(), () => {
  //             this.props.firebase.userEpisodes(key).once("value", (snapshot) => {
  //               if (snapshot.val() === null) return
  //               const modifiedData = Object.entries(snapshot.val()).reduce((acc, [key, value]) => {
  //                 const show = {
  //                   episodes: value.episodes,
  //                   info: {
  //                     ...value.info,
  //                     isAllWatched_database: `${value.info.allEpisodesWatched}_${value.info.database}`
  //                   }
  //                 }
  //                 acc = { ...acc, [key]: show }
  //                 return acc
  //               }, {})

  //               this.props.firebase.userEpisodes(key).set(modifiedData)
  //               console.log(modifiedData)
  //             })
  //           })
  //         })
  //     })
  //   })
  // }

  databaseModify = () => {
    const todayConverted = `${todayDate.getDate()}-${todayDate.getMonth() + 1}-${todayDate.getFullYear()}`
    const threeDaysBefore = new Date(todayDate.getTime() - 259200000)

    const threeDaysBeforeConverted = `${threeDaysBefore.getDate()}-${
      threeDaysBefore.getMonth() + 1
    }-${threeDaysBefore.getFullYear()}`
    console.log(threeDaysBefore)

    axios
      .get(
        `https://api.themoviedb.org/3/tv/changes?api_key=${process.env.REACT_APP_TMDB_API}&end_date=${todayConverted}&start_date=${threeDaysBeforeConverted}`
      )
      .then(({ data }) => {
        data.results.forEach((show) => {
          this.props.firebase
            .showInDatabase(show.id)
            .child("id")
            .once("value", (snapshot) => {
              if (snapshot.val() !== null) {
                console.log(snapshot.val())
                axios
                  .get(
                    `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`
                  )
                  .then(({ data: { number_of_seasons } }) => {
                    const maxSeasonsInChunk = 20
                    const allSeasons = []
                    const seasonChunks = []
                    const apiRequests = []

                    for (let i = 1; i <= number_of_seasons; i += 1) {
                      allSeasons.push(`season/${i}`)
                    }

                    for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
                      const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
                      seasonChunks.push(chunk.join())
                    }

                    seasonChunks.forEach((item) => {
                      const request = axios.get(
                        `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
                      )
                      apiRequests.push(request)
                    })

                    return axios.all([...apiRequests])
                  })
                  .then(
                    axios.spread((...responses) => {
                      const rowData = []
                      const seasonsData = []

                      responses.forEach((item) => {
                        rowData.push(item.data)
                      })

                      const mergedRowData = Object.assign({}, ...rowData)

                      Object.entries(mergedRowData).forEach(([key, value]) => {
                        if (!key.indexOf("season/")) {
                          seasonsData.push({ [key]: { ...value } })
                        }
                      })

                      const allEpisodes = []

                      seasonsData.forEach((data, index) => {
                        const season = data[`season/${index + 1}`]
                        if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

                        const episodes = []

                        season.episodes.forEach((item) => {
                          const updatedEpisode = {
                            air_date: item.air_date,
                            episode_number: item.episode_number,
                            name: item.name,
                            season_number: item.season_number,
                            id: item.id
                          }
                          episodes.push(updatedEpisode)
                        })

                        const updatedSeason = {
                          air_date: season.air_date,
                          season_number: season.season_number,
                          id: season._id,
                          poster_path: season.poster_path,
                          name: season.name,
                          episodes
                        }

                        allEpisodes.push(updatedSeason)
                      })

                      const dataToPass = {
                        episodes: allEpisodes,
                        status: mergedRowData.status
                      }

                      return dataToPass
                    })
                  )
                  .then((data) => {
                    this.props.firebase
                      .showInDatabase(show.id)
                      .update({ episodes: data.episodes, status: data.status })
                      .catch((err) => {
                        console.log(err)
                      })
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
        })
      })
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Profile | TV Junkie</title>
        </Helmet>
        <Header />
        <div className="user-profile">
          <div className="user-profile__email">
            Sign in with <span>{this.props.authUser.email}</span>
          </div>
          <div className="user-profile__verified">
            {this.props.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <>
                Email not verified{" "}
                <button onClick={this.sendEmailVerification} className="button" type="button">
                  {this.state.verificationSent ? "Verification sent" : "Send email verification"}
                </button>
              </>
            )}
          </div>
          <div className="user-profile__signout">
            <SignOutButton />
          </div>
          {_get(this.state.authUser, "email", "") === "test@test.com" && (
            <div className="update-database">
              <button onClick={() => this.databaseModify()} className="button" type="button">
                Update Database
              </button>
            </div>
          )}
        </div>
        <Footer />
      </>
    )
  }
}

const condition = (authUser) => authUser !== null

export default compose(WithAuthenticationConsumer, userContentHandler, WithAuthorization(condition))(Profile)
