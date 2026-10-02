import { Component } from "react";

// If a page or game breaks, show a friendly way out instead of a blank screen.
// Give it a `key` that changes with the page so moving on clears the error.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error("Spark Lab page error", error, info?.componentStack); }
  render() {
    if (!this.state.failed) return this.props.children;
    const home = this.props.home ?? "#/";
    return (
      <div className="panel oops" role="alert">
        <div className="em" aria-hidden="true">🙈</div>
        <h2>Oops! Something went wrong.</h2>
        <p className="lead">It's not your fault. Let's try again.</p>
        <div className="row center-row">
          <button className="btn primary big" onClick={() => this.setState({ failed: false })}>🔄 Try again</button>
          <a className="btn big" href={home} onClick={() => this.setState({ failed: false })}>🏠 Go home</a>
        </div>
      </div>
    );
  }
}
