import React, { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: false, info: '', message: '' }
  }

  componentDidCatch(err, info) {
    this.setState({ error: true, info, message: err })
  }

  render() {
    if (this.state.error) {
      return (
        <>
          <h1>error:</h1>

          <h2>message: {this.state.message}</h2>

          <div>
            {this.state.info.componentStack.split('in ').map(item => (
              <p>{item}</p>
            ))}
          </div>
        </>
      )
    }
    return this.props.children
  }
}
