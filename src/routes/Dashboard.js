// Youssef Selkani
// 2019

import {
  Button, Form, Divider,
  Dimmer, Loader, TextArea,
  Message, Segment
} from 'semantic-ui-react';
import React, { Component } from "react";
import fire from "../config/Fire";
import "../App.css";
import { CompactPicker } from 'react-color';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      updateSuccess: false,
      data: [],
      title: '',
      link: '',
    };
  }

  // Form Handler
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  newURL = e => {
    this.setState({ loading: true, updateSuccess: false });
    e.preventDefault();
    const { currentUser } = fire.auth();
    let title = this.state.title;
    let link = this.state.link;
    fire
      .database()
      .ref(`master/${currentUser.displayName}/links/`)
      .push({
        title,
        link,
      })
      .then(() => {
        this.setState({ loading: false, updateSuccess: true });
      });
  };

  editProfile = e => {
    this.setState({ loading: true, updateSuccess: false, dimmed: true });
    e.preventDefault();
    const { currentUser } = fire.auth();
    fire
      .database()
      .ref(`master/${currentUser.displayName}/setup/`)
      .update({
        bio: this.state.bio,
        fullName: this.state.name,
        photoURL: this.state.image,
        accent: this.state.accent,
      })
      .then(() => {
        currentUser.updateProfile({
          photoURL: this.state.image,
        })
        this.setState({ loading: false, updateSuccess: true, dimmed: false })
      });
  };


  logout() {
    window.location.reload()
    fire.auth().signOut();
  }

  delete = (index) => {
    const { currentUser } = fire.auth();
    fire.database().ref(`master/${currentUser.displayName}/links/${this.state.keys[index]}`)
      .remove()
  }

  componentDidMount = () => {
    this.setState({ loading: true })
    const { currentUser } = fire.auth();
    this.setState({
      name: currentUser.displayName,
      bio: currentUser.bio,
      image: currentUser.photoURL,
    })
    fire.database().ref(`/master/${currentUser.displayName}/setup/`)
      .on('value', snapshot => {
        var obj = snapshot.val()
        this.setState({
          bio: obj.bio,
          fullName: obj.fullName,
          name: obj.fullName,
          accent: obj.accent,
        })
      })
    fire.database().ref(`/master/${currentUser.displayName}/links/`)
      .on('value', snapshot => {
        var obj = snapshot.val()
        var data = []
        var keys = []
        for (let a in obj) {
          data.push(obj[a])
          keys.push(a)
        }
        this.setState({
          data: data, keys: keys,
          loading: false,
        })
      });
  }

  handleChangeComplete = (color) => {
    this.setState({ accent: color.hex });
  };

  render() {
    const { dimmed } = this.state
    const listItems = this.state.data.map((item, index) =>
      <div key={index}>
        <Message color='black'>
          <Button onClick={() => this.delete(index)}
            compact circular
            icon='delete'
            color='grey'
          />
          {item.title}
        </Message>
        <Divider hidden />
      </div>

    );
    return (
      <div className="dashboard">
        <Dimmer.Dimmable blurring dimmed={dimmed}>
          <Divider hidden />

          <h1>Hello {this.state.name}</h1>
          <p>{this.state.bio}</p>

          <img src={this.state.image} style={{ paddingBottom: '2%' }} alt='profilePicture' width='120px' />



          {this.state.loading ?
            <div>
              <Divider hidden />
              <Loader inline
                size='medium'
                inverted active>Loading</Loader>
              <Divider hidden />
            </div>
            : null}

          <h3>Edit Profile</h3>
          <Divider hidden />

          <Form inverted>
            <Form.Input
              type="text" onChange={this.handleChange}
              placeholder="Full Name" name="name" />
            <Form.Input
              type="text" onChange={this.handleChange}
              placeholder="Profile Image" name="image" />
            <Form.Input
              type="text" onChange={this.handleChange}
              placeholder="Accent Color" name="accent" />

            <CompactPicker id='picker'
              color={this.state.accent}
              onChangeComplete={this.handleChangeComplete}
            />

            <TextArea placeholder="Bio" name="bio"
              onChange={this.handleChange} style={{ minHeight: 100 }} />
            <Divider hidden />
            <Button onClick={this.editProfile} inverted >
              Save
          </Button>
            <Divider hidden />
          </Form>

          {this.state.updateSuccess ? (
            <div>
              <Message positive>
                <Message.Header>Updated successfully!</Message.Header>
                <p>Data has been saved.</p>
              </Message>
            </div>
          ) : null}

          <h3>Add Link</h3>
          <Divider hidden />

          <Form>
            <Form.Input
              type="text" onChange={this.handleChange}
              placeholder="Title" name="title" />
            <Form.Input
              type="text" onChange={this.handleChange}
              placeholder="Link" name="link" />
            <Divider hidden />
            <Button onClick={this.newURL} inverted>
              Submit
          </Button>
          </Form>

          <Divider hidden />
          {listItems}
          <Divider hidden />

          <Button fluid color='grey' inverted compact>
            View Profile
          </Button>

          <Divider hidden />
          <Button onClick={this.logout} color='red'>
            Log Out
            </Button>
          <Divider hidden />

        </Dimmer.Dimmable>
      </div>
    );
  }
}

export default Dashboard;
