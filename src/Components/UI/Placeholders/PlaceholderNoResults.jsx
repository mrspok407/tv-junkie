import React, { Component } from 'react'

export default class PlaceholderNoResults extends Component {
  render() {
    return <div className={`placeholder--no-results ${this.props.className || ''}`}>{this.props.message}</div>
  }
}

const PlaceholderNoResults = () => {
  return <div className={`placeholder--no-results ${this.props.className || ''}`}>{this.props.message}</div>
}

export default PlaceholderNoResults
