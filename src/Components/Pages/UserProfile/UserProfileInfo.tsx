import React, { useState, useEffect, useContext, useCallback } from 'react'
import { AppContext } from 'Components/AppContext/ContextsWrapper'
import classNames from 'classnames'
import Loader from 'Components/UI/Placeholders/Loader'
import { FirebaseContext } from 'Components/Firebase'
import { Helmet } from 'react-helmet'
import CreatePortal from 'Components/UI/Modal/CreatePortal'
import ModalContent from 'Components/UI/Modal/ModalContent'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useResponseContactRequest from './Hooks/UseResponseContactRequest'
import useSendContactRequest from './Hooks/UseSendContactRequest'

type Props = {
  userUid: string
}

interface ContactInfo {
  status: boolean | string
  receiver: boolean
  userName: string
  pinned_lastActivityTS: string
  timeStamp: number
  newActivity: boolean
}

const UserProfileInfo: React.FC<Props> = ({ userUid }) => {
  const { firebase, authUser, errors } = useFrequentVariables()

  const [userName, setUserName] = useState('')
  const [loadingUserName, setLoadingUserName] = useState(true)

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loadingContactInfo, setLoadingContactInfo] = useState(true)

  const { sendContactRequest, contactRequestLoading } = useSendContactRequest({
    contactName: userName,
    contactUid: userUid,
  })
  const { handleContactRequest, responseContactRequestLoading } = useResponseContactRequest({ contactUid: userUid })

  const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

  const getUserName = useCallback(async () => {
    const userName = await firebase.user(userUid).child('username').once('value')
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
    contactRef.on('value', (snapshot: { val: () => ContactInfo }) => {
      setContactInfo(snapshot.val())
      setLoadingContactInfo(false)
    })
    return () => {
      contactRef.off()
      contactRef.child('receiver').off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
              <span className="new-request__name">{userName}</span> wants to connect
            </div>
            <div className="new-request__actions--receiver">
              <button className="button" onClick={() => handleContactRequest({ status: 'accept' })}>
                {responseContactRequestLoading.accept ? <span className="button-loader-circle" /> : 'Accept'}
              </button>
              <button
                className="button"
                onClick={() => {
                  handleContactRequest({ status: 'rejected' })
                }}
              >
                {responseContactRequestLoading.rejected ? <span className="button-loader-circle" /> : 'Reject'}
              </button>
            </div>
          </div>
        ) : (
          <div className="new-request__message">
            The invitation to connect has been sent to <span className="new-request__name">{userName}</span>
          </div>
        )
      ) : contactInfo?.status === 'rejected' ? (
        <>
          <div className="user-profile__request-message">
            <span className="user-profile__name">{userName}</span> rejected you connect request{' '}
          </div>
          <div className="user-profile__actions">
            <button className="button" onClick={() => sendContactRequest()}>
              {contactRequestLoading ? <span className="button-loader-circle" /> : 'Send again'}
            </button>
          </div>
        </>
      ) : (
        (contactInfo === null || contactInfo.status === 'removed') && (
          <>
            <div className="user-profile__username">
              <span className="user-profile__name">{userName}</span>
            </div>
            <div className="user-profile__actions">
              <button className="button" onClick={() => sendContactRequest()}>
                {contactRequestLoading ? <span className="button-loader-circle" /> : 'Add to contacts'}
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
        <title>{userName || 'Nameless'} User Profile | TV Junkie</title>
      </Helmet>
      <div
        className={classNames('user-profile', {
          'user-profile--own-profile': authUser?.uid === userUid,
        })}
      >
        {authUser?.uid === userUid ? (
          <div className="user-profile--own-profile-message">This is your profile</div>
        ) : loadingUserInfo ? (
          <Loader className="loader--small-pink" />
        ) : !authUser?.uid ? (
          <div className="user-profile__username">
            <span className="user-profile__name">{userName}</span>
          </div>
        ) : (
          renderUserInfo()
        )}
      </div>
      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />} />}
    </>
  )
}

export default UserProfileInfo
