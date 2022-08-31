/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import SignOutButton from 'Components/UserAuth/SignOut/SignOutButton'
import { currentDate } from 'Utils'
import PasswordUpdate from 'Components/UserAuth/PasswordUpdate/PasswordUpdate'
import classNames from 'classnames'
import { LoremIpsum } from 'lorem-ipsum'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import sub from 'date-fns/sub'
import './Settings.scss'
import sortDataSnapshot from 'Components/UserContent/FirebaseHelpers/sortDataSnapshot'
import { episodesToOneArray } from 'Components/UserContent/UseUserShowsRed/Utils/episodesOneArrayModifiers'

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

  const updateAllEpisodesWatchedUserShows = async () => {
    const promises = []
    const usersKeys = []
    try {
      const usersSnapshot = await firebase.users().once('value')

      usersSnapshot.forEach((snapshot) => {
        promises.push(firebase.showsEpisodesUserDatabase(snapshot.key).once('value'))
        usersKeys.push(snapshot.key)
      })

      const usersEpisodes = await Promise.all(promises)

      usersEpisodes.forEach((snapshot, index) => {
        if (snapshot.val() === null) return

        Object.entries(snapshot.val()).forEach(([key, value]) => {
          const isAnyEpisodeNotWatched = episodesToOneArray(value.episodes).some((episode) => !episode.watched)
          firebase.userShow({ authUid: usersKeys[index], key }).update({ allEpisodesWatched: !isAnyEpisodeNotWatched })
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  const createAllShowsListIds = async () => {
    const updateData = {}
    try {
      const allShowsListSnapshot = await firebase.allShowsList().once('value')

      allShowsListSnapshot.forEach((snapshot) => {
        updateData[`allShowsListIds/${snapshot.key}`] = true
      })
      console.log({ updateData })
      firebase.rootRef().update(updateData)
    } catch (error) {
      console.log({ error })
    }
  }

  const updateShowsDataInDatabase = async ({ isUpdateAll = false }) => {
    const startDate = sub(currentDate, {
      days: 3,
    })

    let showsToUpdateIds = []

    try {
      if (isUpdateAll) {
        const allShowsIdsSnapshot = await firebase.allShowsListIds().once('value')
        showsToUpdateIds = sortDataSnapshot(allShowsIdsSnapshot).map((item) => item.key)
      } else {
        const { data: recentlyUpdatedShows } = await axios.get(
          `https://api.themoviedb.org/3/tv/changes?api_key=${process.env.REACT_APP_TMDB_API}&start_date=${startDate}`,
        )

        const showsToUpdateSnapshots = await Promise.all(
          recentlyUpdatedShows.results.map(({ id: showId }) => {
            return firebase.showFullDataFireDatabase(showId).child('id').once('value')
          }),
        )

        showsToUpdateIds = showsToUpdateSnapshots.reduce((acc, snapshot) => {
          if (snapshot.exists()) {
            acc.push(snapshot.val())
          }
          return acc
        }, [])
      }

      const updateData = await Promise.allSettled(
        showsToUpdateIds.map(async (showId) => {
          const { data: showInfo } = await axios.get(
            `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
          )

          const maxSeasonsInChunk = 20
          const allSeasons = []
          const seasonChunks = []
          const apiRequests = []
          for (let i = 1; i <= showInfo.number_of_seasons; i += 1) {
            allSeasons.push(`season/${i}`)
          }
          for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
            const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
            seasonChunks.push(chunk.join())
          }
          seasonChunks.forEach((item) => {
            const request = axios.get(
              `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`,
            )
            apiRequests.push(request)
          })

          return axios.all([...apiRequests]).then(
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
                    id: item.id,
                    name: item.name || null,
                    season_number: item.season_number || null,
                  }
                  episodes.push(updatedEpisode)
                })
                const updatedSeason = {
                  air_date: season.air_date || '',
                  episodes,
                  id: season._id,
                  name: season.name || null,
                  poster_path: season.poster_path || null,
                  season_number: season.season_number || null,
                }
                allEpisodes.push(updatedSeason)
              })
              const finalData = {
                episodes: allEpisodes,
                info: showInfo,
                status: mergedRowData.status,
                name: mergedRowData.name,
                vote_average: mergedRowData.vote_average,
                vote_count: mergedRowData.vote_count,
                showId,
              }
              return finalData
            }),
          )
        }),
      )

      const updateDataFirebase = {}
      updateData.forEach((promiseResult) => {
        if (promiseResult.status !== 'fulfilled') return
        const showData = promiseResult.value
        updateDataFirebase[`allShowsList/${showData.showId}/episodes`] = showData.episodes
        updateDataFirebase[`allShowsList/${showData.showId}/status`] = showData.status
        updateDataFirebase[`allShowsList/${showData.showId}/info`] = showData.info
      })

      console.log({ updateData })
      firebase.rootRef().update(updateDataFirebase)
    } catch (error) {
      console.log({ error })
    }
  }

  const setUsersWatchingShow = async () => {
    const usersListSnapshot = await firebase.rootRef().child('users').once('value')
    console.log({ usersListSnapshot: usersListSnapshot.val() })

    Object.entries(usersListSnapshot.val()).forEach(([userKey, value]) => {
      const userShows = value?.content?.shows
      if (!userShows) return
      const showsKeys = Object.keys(userShows)

      showsKeys.forEach((showKey) => {
        firebase.rootRef().child(`allShowsList/${showKey}/usersWatchingList/${userKey}`).set(true)
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
      </div>
      <PasswordUpdate />
      {[process.env.REACT_APP_TEST_EMAIL, process.env.REACT_APP_ADMIN_EMAIL].includes(authUser?.email) && (
        <>
          <div className="update-database">
            <button onClick={updateShowsDataInDatabase} className="button button--profile" type="button">
              Update Recent Shows In Database
            </button>
          </div>

          <div className="update-database">
            <button
              onClick={() => updateShowsDataInDatabase({ isUpdateAll: true })}
              className="button button--profile"
              type="button"
            >
              Update All Shows In Database
            </button>
          </div>

          <div>
            <button onClick={createAllShowsListIds} className="button button--profile" type="button">
              Create all shows ids
            </button>
          </div>

          <div className="update-database">
            <button onClick={setUsersWatchingShow} className="button button--profile" type="button">
              Set users watching show
            </button>
          </div>
          <div className="update-database">
            <button onClick={() => updateShowsDataInDatabase()} className="button button--profile" type="button">
              Update Database
            </button>
          </div>
          <div className="update-database">
            <button
              onClick={() => updateAllEpisodesWatchedUserShows()}
              className="button button--profile"
              type="button"
            >
              Update all episodes watched
            </button>
          </div>
        </>
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
