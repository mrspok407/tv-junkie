import React, { useState, useEffect, useContext, useCallback } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import { FirebaseContext } from "Components/Firebase"
import { Helmet } from "react-helmet"
import useSendContactRequest from "./Hooks/UseSendContactRequest"
import useResponseContactRequest from "./Hooks/UseResponseContactRequest"
import CreatePortal from "Components/UI/Modal/CreatePortal"
import ModalContent from "Components/UI/Modal/ModalContent"
import useRecipientNotified from "./Hooks/UseRecipientNotified"

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
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const [userName, setUserName] = useState("")
  const [loadingUserName, setLoadingUserName] = useState(true)

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loadingContactInfo, setLoadingContactInfo] = useState(true)

  const [isRecipientNotified, setIsRecipientNotified] = useState<boolean | null>(null)
  const [isReceiver, setIsReceiver] = useState<boolean | null>(null)

  const { sendContactRequest } = useSendContactRequest({ userName, userUid })
  const { handleContactRequest } = useResponseContactRequest({ userUid })
  const { updateRecipientNotified } = useRecipientNotified({ userUid })

  const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

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
    const attachFirebaseListeners = async () => {
      contactRef.on("value", (snapshot: { val: () => ContactInfo }) => {
        setContactInfo(snapshot.val())
        setLoadingContactInfo(false)
      })
      contactRef.child("recipientNotified").on("value", (snapshot: { val: () => boolean | null }) => {
        setIsRecipientNotified(snapshot.val())
      })
      contactRef.child("receiver").on("value", (snapshot: { val: () => boolean | null }) => {
        setIsReceiver(snapshot.val())
      })
    }
    attachFirebaseListeners()
    return () => {
      contactRef.off()
      contactRef.child("recipientNotified").off()
      contactRef.child("receiver").off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isRecipientNotified === null || isReceiver === null) return
    if (isRecipientNotified === true || isReceiver === true) return
    updateRecipientNotified()
  }, [isRecipientNotified, isReceiver]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="new-request">
            <div className="new-request__message">
              {<span className="new-request__name">{userName}</span>} wants to connect
            </div>
            <div className="new-request__actions--receiver">
              <button className="button" onClick={() => handleContactRequest({ status: "accept" })}>
                Accept
              </button>
              <button
                className="button"
                onClick={() => {
                  handleContactRequest({ status: "rejected" })
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="new-request__message">
            The invitation to connect has been sent to {<span className="new-request__name">{userName}</span>}
          </div>
        )
      ) : contactInfo?.status === "rejected" ? (
        <>
          <div className="user-profile__request-message">
            {<span className="user-profile__name">{userName}</span>} rejected you connect request{" "}
          </div>
          <div className="user-profile__actions">
            <button className="button" onClick={() => sendContactRequest({ resendRequest: true })}>
              Send again
            </button>
          </div>
        </>
      ) : (
        contactInfo === null && (
          <>
            <div className="user-profile__username">{<span className="user-profile__name">{userName}</span>}</div>
            <div className="user-profile__actions">
              <button className="button" onClick={() => sendContactRequest({ resendRequest: false })}>
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
        ) : !authUser ? (
          <div className="user-profile__username">{<span className="user-profile__name">{userName}</span>}</div>
        ) : (
          renderUserInfo()
        )}
      </div>
      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />}></CreatePortal>}
    </>
  )
}

export default UserProfileInfo
