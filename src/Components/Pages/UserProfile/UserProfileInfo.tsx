import React, { useState, useEffect, useContext, useCallback } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import { FirebaseContext } from "Components/Firebase"
import { Helmet } from "react-helmet"

type Props = {
  userUid: string
}

const UserProfileInfo: React.FC<Props> = ({ userUid }) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const [userName, setUserName] = useState("")
  const [loadingUserName, setLoadingUserName] = useState(true)

  const [contactStatus, setContactStatus] = useState<null | boolean | string>(null)
  const [loadingContactStatus, setLoadingConctactStatus] = useState(true)

  const getUserName = useCallback(async () => {
    const userName = await firebase.user(userUid).child("username").once("value")
    if (userName === null) {
      setLoadingUserName(false)
      return
    }
    setUserName(userName.val())
    setLoadingUserName(false)
  }, [userUid, firebase])

  useEffect(() => {
    getUserName()
  }, [getUserName])

  useEffect(() => {
    const contactStatusRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid }).child("status")
    contactStatusRef.on("value", (snapshot: { val: () => null | boolean | string }) => {
      setContactStatus(snapshot.val())
      setLoadingConctactStatus(false)
    })
    return () => contactStatusRef.off()
  }, [userUid, firebase, authUser])

  const sendContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStamp = firebase.timeStamp()

    contactRef.set(
      {
        status: false,
        receiver: true,
        userName,
        pinned_lastActivityTS: "false",
        timeStamp,
        recipientNotified: false
      },
      async () => {
        const contactInfo = await contactRef.once("value")
        const timeStamp = contactInfo.val().timeStamp
        const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")
        contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })

        // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
        // newContactRequestCloud({ contactUid: userUid, timeStamp })

        const authUserName = await firebase.users().child(`${authUser?.uid}/username`).once("value")

        firebase
          .users()
          .child(`${userUid}/contactsDatabase/contactsList/${authUser?.uid}`)
          .set({
            status: false,
            receiver: false,
            userName: authUserName.val(),
            pinned_lastActivityTS: `false_${timeStamp}`,
            timeStamp,
            recipientNotified: false,
            newActivity: true
          })
      }
    )
  }

  const resendContactRequest = () => {}

  const renderUserInfo = () => (
    <>
      {contactStatus === true ? (
        `You're friends with ${userName}`
      ) : contactStatus === false ? (
        <>
          <div className="user-profile__username">{!userName ? "Nameless user" : userName}</div>
          <div className="user-profile__request--sent">
            <div>Request sent</div>
          </div>
        </>
      ) : contactStatus === "rejected" ? (
        <>
          <div className="user-profile__username">{!userName ? "Nameless user" : userName}</div>
          <div className="user-profile__request">
            <button className="button" onClick={() => resendContactRequest()}>
              Add to contacts
            </button>
          </div>
        </>
      ) : (
        contactStatus === null && (
          <>
            <div className="user-profile__username">{!userName ? "Nameless user" : userName}</div>
            <div className="user-profile__request">
              <button className="button" onClick={() => sendContactRequest()}>
                Add to contacts
              </button>
            </div>
          </>
        )
      )}
    </>
  )

  const loadingUserInfo = loadingUserName || loadingContactStatus

  return (
    <>
      <Helmet>
        <title>{userName ? userName : "Nameless"} User Profile | TV Junkie</title>
      </Helmet>
      <div
        className={classNames("user-profile", {
          "user-profile--own-profile": authUser?.uid === userUid,
          "user-profile--both-friends": contactStatus === true
        })}
      >
        {authUser?.uid === userUid ? (
          <div className="user-profile--own-profile-message">This is your profile</div>
        ) : loadingUserInfo ? (
          <Loader className="loader--small-pink" />
        ) : (
          renderUserInfo()
        )}
      </div>
    </>
  )
}

export default UserProfileInfo
