import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false, info: "", message: "" };
  }

  componentDidCatch(err, info) {
    this.setState({ error: true, info, message: err });

    console.log(err, info);
  }

  render() {
    if (this.state.error)
      return (
        <h1>there's an error here! => {this.state.info.componentStack}</h1>
      );
    return this.props.children;
  }
}
