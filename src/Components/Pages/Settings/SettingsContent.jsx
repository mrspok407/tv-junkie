/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import SignOutButton from 'Components/UserAuth/SignOut/SignOutButton'
import { currentDate } from 'Utils'
import PasswordUpdate from 'Components/UserAuth/PasswordUpdate/PasswordUpdate'
import classNames from 'classnames'
import { LoremIpsum } from 'lorem-ipsum'
import './Settings.scss'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

let startTimeStampGroupChats = 1311011245000

const SettingsContent = () => {
  const { firebase, authUser } = useFrequentVariables()

  const [verificationSent, setVerificationSent] = useState(false)
  const [loadingVerificationSent, setLoadingVerificationSent] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(null)

  const clipboardTimeout = useRef(null)

  useEffect(() => {
    const timeoutClipBoard = clipboardTimeout.current
    return () => {
      window.clearTimeout(timeoutClipBoard)
    }
  }, [])

  const sendEmailVerification = () => {
    setVerificationSent(true)
    firebase
      .sendEmailVerification()
      .then(() => {
        setVerificationSent(true)
        setLoadingVerificationSent(false)
      })
      .catch(() => {
        setLoadingVerificationSent(false)
      })
  }

  const addMessagesToPrivateChats = async () => {
    const authUserUid = 'hZK2fqeACBUqZiyj1zrbuFXZzRP2'
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4,
      },
      wordsPerSentence: {
        max: 8,
        min: 4,
      },
    })
    const fourHoursInMS = 14400000

    // firebase.groupChats().once("value", (snapshot) => {
    //   // console.log(snapshot.val())
    //   console.log(JSON.stringify(snapshot.val()))
    // })

    firebase.contactsList({ uid: authUserUid }).once('value', (snapshot) => {
      Object.entries(snapshot.val()).forEach(async ([contactKey, contactValue]) => {
        if (contactValue.status !== true) return
        let startTimeStampPrivateChats = 1313142446000
        const chatKey = contactKey < authUserUid ? `${contactKey}_${authUserUid}` : `${authUserUid}_${contactKey}`
        const numberOfMessages = 1000
        const messages = {}
        for (let i = 1; i <= numberOfMessages; i += 1) {
          const messageRef = await firebase.messages({ chatKey, isGroupChat: false }).push()
          messages[`${messageRef.key}`] = {
            sender: Math.random() > 0.5 ? contactKey : authUserUid,
            message: lorem.generateSentences(Math.ceil(Math.random() * 3)),
            timeStamp: startTimeStampPrivateChats,
          }
          startTimeStampPrivateChats += fourHoursInMS
        }
        console.log(messages)
        await firebase.messages({ chatKey, isGroupChat: false }).set(messages)
      })
    })
  }

  const addMessagesToGroupChats = async () => {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4,
      },
      wordsPerSentence: {
        max: 8,
        min: 4,
      },
    })
    const fourHoursInMS = 14400000
    firebase.groupChats().once('value', (snapshot) => {
      Object.entries(snapshot.val()).forEach(([chatKey, chatValue]) => {
        Object.entries(chatValue.members.status).forEach(([memberKey, memberValue]) => {
          const numberOfMessages = Math.floor(Math.random() * (15 - 1 + 1)) + 1
          for (let i = 1; i <= numberOfMessages; i += 1) {
            firebase.messages({ chatKey, isGroupChat: true }).push({
              sender: memberKey,
              userName: memberValue.userName,
              message: lorem.generateSentences(Math.ceil(Math.random() * 3)),
              timeStamp: startTimeStampGroupChats,
            })
            startTimeStampGroupChats += fourHoursInMS
          }
        })
      })
    })
  }

  const databaseModify = () => {
    // this.context.firebase.userAllShows("I9OcmC25eKfieOWppn6Pqr1sVj02").once("value", (snapshot) => {
    //   const modified = Object.entries(snapshot.val()).reduce((acc, [key, value]) => {
    //     return { ...acc, [key]: { lastUpdatedInUser: value.timeStamp } }
    //   }, {})
    //   this.context.firebase.userShowsLastUpdateList("I9OcmC25eKfieOWppn6Pqr1sVj02").set(modified)

    //   // Object.keys(snapshot.val()).forEach((key) => {
    //   //   this.context.firebase.userShow({ uid: this.context.authUser.uid, key }).update({ lastUpdatedInUser: null })
    //   // })
    // })

    const todayConverted = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`
    const threeDaysBefore = new Date(currentDate.getTime() - 259200000)

    // const threeDaysBeforeConverted = `${threeDaysBefore.getDate()}-${
    //   threeDaysBefore.getMonth() + 1
    // }-${threeDaysBefore.getFullYear()}`

    axios
      .get(
        `https://api.themoviedb.org/3/tv/changes?api_key=${process.env.REACT_APP_TMDB_API}&end_date=${todayConverted}&start_date=${threeDaysBefore}`,
      )
      .then(async ({ data }) => {
        // const tempData = [{ id: 1396 }]
        // const allShowsIds = await firebase
        //   .allShowsList()
        //   .once('value')
        //   .then((snapshot) =>
        //     Object.keys(snapshot.val()).map((id) => {
        //       return { id }
        //     }),
        //   )

        data.results.forEach((show) => {
          firebase
            .showFullDataFireDatabase(show.id)
            .child('id')
            .once('value', (snapshot) => {
              if (snapshot.val() !== null) {
                axios
                  .get(
                    `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
                  )
                  .then(({ data: { number_of_seasons } }) => {
                    console.log(show.id)
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
                        `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`,
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
                        if (!key.indexOf('season/')) {
                          seasonsData[value.season_number - 1] = { [key]: { ...value } }
                        }
                      })
                      const allEpisodes = []
                      seasonsData.forEach((data, index) => {
                        const season = data[`season/${index + 1}`]
                        if (!Array.isArray(season.episodes) || season.episodes.length === 0) return
                        const episodes = []
                        season.episodes.forEach((item) => {
                          const updatedEpisode = {
                            air_date: item.air_date || '',
                            episode_number: item.episode_number || null,
                            name: item.name || null,
                            season_number: item.season_number || null,
                            id: item.id,
                          }
                          episodes.push(updatedEpisode)
                        })
                        const updatedSeason = {
                          air_date: season.air_date || '',
                          season_number: season.season_number || null,
                          id: season._id,
                          poster_path: season.poster_path || null,
                          name: season.name || null,
                          episodes,
                        }
                        allEpisodes.push(updatedSeason)
                      })
                      const dataToPass = {
                        episodes: allEpisodes,
                        status: mergedRowData.status,
                        name: mergedRowData.name,
                      }
                      return dataToPass
                    }),
                  )
                  .then((data) => {
                    firebase
                      .showFullDataFireDatabase(show.id)
                      .update({
                        episodes: data.episodes,
                        status: data.status,
                      })
                      .catch((err) => {
                        console.log(err)
                      })
                    firebase.showInfoFireDatabase(show.id).update({
                      status: data.status,
                      name: data.name,
                    })
                    firebase.showInfoFireDatabase(show.id).child('lastUpdatedInDatabase').set(firebase.timeStamp())
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
        })
      })
  }

  const copyToClipboard = (text) => {
    clearTimeout(clipboardTimeout.current)
    navigator.clipboard.writeText(text)
    setCopiedToClipboard(true)
    clipboardTimeout.current = setTimeout(() => {
      setCopiedToClipboard(false)
    }, 3000)
  }

  return (
    <div className="user-settings">
      <div className="user-settings__email">
        Sign in with <span>{authUser.email}</span>
      </div>
      <div className="user-settings__verified">
        {authUser.emailVerified ? (
          'Email verified'
        ) : (
          <>
            Email not verified{' '}
            {verificationSent ? (
              <div className="user-settings__sent-message">Verification sent</div>
            ) : (
              <button onClick={sendEmailVerification} className="button button--profile" type="button">
                {loadingVerificationSent ? <span className="button-loader-circle" /> : 'Send email verification'}
              </button>
            )}
          </>
        )}
        {/* {error && (
        <div className="user-settings__error-email-verification">{error.message}</div>
      )} */}
      </div>
      <PasswordUpdate />
      {[process.env.REACT_APP_TEST_EMAIL, process.env.REACT_APP_ADMIN_EMAIL].includes(authUser?.email) && (
        <div className="update-database">
          <button onClick={() => databaseModify()} className="button button--profile" type="button">
            Update Database
          </button>
        </div>
      )}
      <div className="user-settings__copy-user-link">
        <div
          className={classNames('button', {
            'button--clipboard-copied': copiedToClipboard,
          })}
          onClick={() => {
            copyToClipboard(
              `${process.env.NODE_ENV === 'production' ? 'https://www.tv-junkie.com' : 'http://localhost:3000'}/user/${
                authUser.uid
              }`,
            )
          }}
        >
          {!copiedToClipboard ? (
            <span
              className={classNames('clipboard-message', {
                'clipboard-message__not-copied': copiedToClipboard === false,
              })}
            >
              Copy profile link
            </span>
          ) : (
            <span
              className={classNames('clipboard-message', {
                'clipboard-message__copied': copiedToClipboard,
              })}
            >
              Copied
            </span>
          )}
        </div>
      </div>
      {['testchat@gmail.com', process.env.REACT_APP_ADMIN_EMAIL].includes(authUser?.email) && (
        <>
          <button type="button" className="button" onClick={() => addMessagesToGroupChats()}>
            Messages to group chats
          </button>
          <button type="button" className="button" onClick={() => addMessagesToPrivateChats()}>
            Messages to private chats
          </button>
        </>
      )}
      <div className="user-settings__signout">
        <SignOutButton />
      </div>
    </div>
  )
}

export default SettingsContent
