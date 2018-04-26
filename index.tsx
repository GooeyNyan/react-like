/** @jsx createElement */
import { render, createElement } from "./render";
import { Component } from "./component";
// import * as React from "react";
const stories = [
  { name: "Didact introduction", url: "http://bit.ly/2pX7HNn" },
  { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" },
  { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" },
  { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" },
  { name: "Components and state", url: "http://bit.ly/2rE16nh" }
];
class App extends Component {
  render() {
    return createElement(
      "div",
      null,
      createElement("h1", null, "Didact Stories"),
      this.props.stories.map(story =>
        createElement(Story, { name: story.name, url: story.url })
      )
    );
    // return (
    //   <div>
    //     <h1>Didact Stories</h1>
    //     {this.props.stories.map(story => (
    //       <Story name={story.name} url={story.url} />
    //     ))}
    //   </div>
    // );
  }
}

class Story extends Component {
  constructor(props) {
    super(props);
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }
  render() {
    const { name, url } = this.props;
    const { likes } = this.state;
    const likesElement = createElement("span", null);
    return createElement(
      "li",
      null,
      createElement(
        "button",
        { onClick: e => this.like() },
        likes,
        createElement("b", null, "\u2764\uFE0F")
      ),
      createElement("a", { href: url }, name)
    );
    // return (
    //   <li>
    //     <button onClick={e => this.like()}>
    //       {likes}
    //       <b>❤️</b>
    //     </button>
    //     <a href={url}>{name}</a>
    //   </li>
    // );
  }
}

render(createElement(App, { stories }), document.getElementById("root"));
// render(<App stories={stories} />, document.getElementById("root"));
