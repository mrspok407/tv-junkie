import React, { Component } from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { Helmet } from "react-helmet"
import * as ROLES from "Utils/Constants/roles"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Header from "Components/Header/Header"
import "./Admin.scss"

class AdminPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      users: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true })

    this.props.firebase.users().on("value", snapshot => {
      const usersObject = snapshot.val()

      const userList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }))

      this.setState({
        users: userList,
        loading: false
      })
    })
  }

  componentWillUnmount() {
    this.props.firebase.users().off()
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Admin page | TV Junkie</title>
        </Helmet>
        <Header />
        <div className="admin">
          <h1>Admin</h1>

          {this.state.loading && <div>Loading...</div>}

          {this.state.users.map(item => (
            <ul key={item.uid}>
              <li>{item.uid}</li>
              <li>{item.email}</li>
            </ul>
          ))}
        </div>
      </>
    )
  }
}

const condition = authUser => authUser && !!authUser.role === ROLES.ADMIN

export default compose(withFirebase, WithAuthorization(condition))(AdminPage)
