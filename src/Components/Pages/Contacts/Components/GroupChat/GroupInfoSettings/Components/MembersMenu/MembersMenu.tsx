import { MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useElementScrolledDown from "Components/Pages/Contacts/Hooks/useElementScrolledDown"
import React, { useState, useEffect, useCallback } from "react"
import SearchInput from "./SearchInput/SearchInput"
import Member from "./Member"
import "./MembersMenu.scss"

const MEMBERS_TO_RENDER = 50

const GroupCreation: React.FC = () => {
  const { firebase, errors, contactsState } = useFrequentVariables()
  const { activeChat, chatMembersStatus, chatParticipants, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}
  const chatMembersStatusData = chatMembersStatus[contactInfo.chatKey] || []
  const chatParticipantsData = chatParticipants[contactInfo.chatKey] || []

  const [renderedMembers, setRenderedMembers] = useState(MEMBERS_TO_RENDER)

  const [searchedMembers, setSearchedMembers] = useState<MembersStatusGroupChatInterface[] | null>([])
  const [isSearching, setIsSearching] = useState(false)

  const [membersListWrapperRef, setMembersListWrapperRef] = useState<HTMLDivElement>(null!)
  const membersListWrapperCallback = useCallback((node) => {
    if (node !== null) {
      setMembersListWrapperRef(node)
    }
  }, [])

  const membersListFireRef = firebase.groupChatMembersStatus({ chatKey: activeChat.chatKey })
  const isScrolledDown = useElementScrolledDown({ element: membersListWrapperRef, threshold: 650 })

  useEffect(() => {
    if (!searchedMembers?.length) return
    setSearchedMembers((prevState) => {
      const newState = prevState?.filter((member) => chatParticipantsData.includes(member.key)) || []
      return newState.length ? newState : null
    })
  }, [chatParticipantsData]) // eslint-disable-line react-hooks/exhaustive-deps

  const getContactsData = async ({ snapshot }: { snapshot: any }) => {
    let members: MembersStatusGroupChatInterface[] = []
    snapshot.forEach((member: { val: () => MembersStatusGroupChatInterface; key: string }) => {
      if (!chatParticipantsData.includes(member.key)) return
      members.push({ ...member.val(), key: member.key })
    })
    setSearchedMembers(members)
    setIsSearching(false)
  }

  const handleSearch = useCallback(
    async (query: string) => {
      if (!chatParticipantsData.length) return
      if (!query || !query.trim()) {
        setSearchedMembers([])
        setIsSearching(false)
        return
      }
      setIsSearching(true)

      try {
        const membersData = await membersListFireRef
          .orderByChild("userNameLowerCase")
          .startAt(query.toLowerCase())
          .endAt(query.toLowerCase() + "\uf8ff")
          .once("value")
        if (membersData.val() === null) {
          setSearchedMembers(null)
          setIsSearching(false)
          return
        }

        getContactsData({ snapshot: membersData })
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setIsSearching(false)
      }
    },
    [chatParticipantsData, errors] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (!isScrolledDown) return
    if (renderedMembers >= chatMembersStatusData.length) return
    setRenderedMembers((prevState) => prevState + MEMBERS_TO_RENDER)
  }, [isScrolledDown, renderedMembers, chatMembersStatusData])

  const contactsToRender = !searchedMembers?.length
    ? chatMembersStatusData
        .filter((member) => chatParticipantsData.includes(member.key))
        .sort((a, b) => (a.userNameLowerCase < b.userNameLowerCase ? -1 : 1))
        .slice(0, renderedMembers)
    : searchedMembers

  return (
    <div className="members-menu">
      <SearchInput onSearch={handleSearch} isSearching={isSearching} />
      <div className="members-list-wrapper" ref={membersListWrapperCallback}>
        <div className="members-list">
          {searchedMembers === null ? (
            <div className="contact-list--no-contacts-text">No members found</div>
          ) : (
            contactsToRender.map((member) => <Member key={member.key} contactInfo={contactInfo} member={member} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupCreation
