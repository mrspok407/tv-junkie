import React, { useState, useEffect, useContext, useCallback } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import { FirebaseContext } from "Components/Firebase"
import { Helmet } from "react-helmet"
import useSendContactRequest from "./Hooks/UseSendContactRequest"
import useResponseContactRequest from "./Hooks/UseResponseContactRequest"
import { _updateRecipientNotified } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userUid: string
}

interface ContactInfo {
  status: boolean | string
  receiver: boolean
  userName: string
  pinned_lastActivityTS: string
  timeStamp: number
  recipientNotified: boolean
  newActivity: boolean
}

const UserProfileInfo: React.FC<Props> = ({ userUid }) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const [userName, setUserName] = useState("")
  const [loadingUserName, setLoadingUserName] = useState(true)

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loadingContactInfo, setLoadingContactInfo] = useState(true)

  const { sendContactRequest, resendContactRequest } = useSendContactRequest({ userName, userUid })
  const { acceptContactRequest, rejectContactRequest } = useResponseContactRequest({ userUid })

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

  const getContactInfo = useCallback(async () => {
    const contactInfoRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

    contactInfoRef.on("value", (snapshot: { val: () => ContactInfo }) => {
      setContactInfo(snapshot.val())
      setLoadingContactInfo(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getContactInfo()
    return () => firebase.contact({ authUid: authUser?.uid, contactUid: userUid }).off()
  }, [getContactInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (contactInfo === null) return
    if (contactInfo?.receiver || contactInfo?.recipientNotified) return
    ;(async () => {
      const updateAuthContactInfo = firebase
        .contact({ authUid: authUser?.uid, contactUid: userUid })
        .update({ recipientNotified: true })
      const updateAuthNewContactsRequests = firebase
        .contactsDatabase({ uid: authUser?.uid })
        .child(`newContactsRequests/${userUid}`)
        .set(null)

      try {
        await Promise.all([updateAuthContactInfo, updateAuthNewContactsRequests])
        _updateRecipientNotified({
          data: { contactUid: userUid },
          context: { auth: { uid: authUser?.uid } },
          database: firebase.database()
        })
        // This should be in https callable

        //  const updateRecipientNotifiedCloud = firebase.httpsCallable("updateRecipientNotified")
        //  updateRecipientNotifiedCloud({ contactUid: userUid })
      } catch (error) {
        console.log(error)
        throw new Error(`There has been some error in updating recipientNotified parameter: ${error}`)
      }
    })()
  }, [contactInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (contactInfo === null) return
    firebase.contact({ authUid: authUser?.uid, contactUid: userUid }).update({ newActivity: null })
  }, [contactInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderUserInfo = () => (
    <>
      {contactInfo?.status === true ? (
        <div className="user-profile__request-message">
          You're friends with <span className="user-profile__name">{userName}</span>
        </div>
      ) : contactInfo?.status === false ? (
        !contactInfo?.receiver ? (
          <>
            <div className="user-profile__request-message">
              {<span className="user-profile__name">{userName}</span>} wants to connect
            </div>
            <div className="user-profile__actions--receiver">
              <button className="button" onClick={() => acceptContactRequest()}>
                Accept
              </button>
              <button className="button" onClick={() => rejectContactRequest()}>
                Reject
              </button>
            </div>
          </>
        ) : (
          <div className="user-profile__request-message">
            The invitation to connect has been sent to {<span className="user-profile__name">{userName}</span>}
          </div>
        )
      ) : contactInfo?.status === "rejected" ? (
        <>
          <div className="user-profile__request-message">
            {<span className="user-profile__name">{userName}</span>} rejected you connect request{" "}
          </div>
          <div className="user-profile__actions">
            <button className="button" onClick={() => resendContactRequest()}>
              Send again
            </button>
          </div>
        </>
      ) : (
        contactInfo === null && (
          <>
            <div className="user-profile__username">{<span className="user-profile__name">{userName}</span>}</div>
            <div className="user-profile__actions">
              <button className="button" onClick={() => sendContactRequest()}>
                Add to contacts
              </button>
            </div>
          </>
        )
      )}
    </>
  )

  const loadingUserInfo = loadingUserName || loadingContactInfo

  return (
    <>
      <Helmet>
        <title>{userName ? userName : "Nameless"} User Profile | TV Junkie</title>
      </Helmet>
      <div
        className={classNames("user-profile", {
          "user-profile--own-profile": authUser?.uid === userUid
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
