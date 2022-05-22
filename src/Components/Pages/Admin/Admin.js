import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import WithAuthorization from 'Components/UserAuth/Session/WithAuthorization/WithAuthorization'
import Header from 'Components/UI/Header/Header'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import './Admin.scss'

class AdminPage extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Admin page | TV Junkie</title>
        </Helmet>
        <Header />
      </>
    )
  }
}

const condition = (authUser) => authUser && authUser.email === process.env.REACT_APP_ADMIN_EMAIL

export default WithAuthorization(condition)(AdminPage)
AdminPage.contextType = AppContext
