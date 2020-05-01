import React from "react";
import { Row, Col, Form, Input, Button, Checkbox, Modal } from "antd";
import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";
import background from "../assets/wallStreer.jpg";
import wallStreet from "../assets/rick-tap-unsplash.jpg";
import { login, createAccount } from "./authapi";
import { Redirect } from "react-router-dom";

class Home extends React.Component {
  state = { visible: false };

  createAccounts = values => {
    console.log("Received values of form: ", values);
    if (values.password !== values.confirmpassword) {
      alert("The passwords dont match");
    } else {
      createAccount(values.email, values.password, values.name,function(created, response) {
        if (created) {
          // <HttpsRedirect route="/" />
          console.log("created");
          alert("You can login now! The page will be reloaded!");
          window.location.reload(false);
        } else {
          console.log("Error creating account: ", response);
          alert(response);
        }
      });
    }
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  onFinish = values => {
    console.log("Received values of form: ", values);
    login(values.email, values.password, function(logged, response) {
      if (logged) {
        // <HttpsRedirect route="/" />
        console.log("logged");
        window.location.reload(false);
      } else {
        console.log("Error login: ", response);
        alert("Error in Login Details")
      }
    });
  };

  render() {
    if (document.cookie.indexOf("token") >= 0) {
      return <Redirect to="/dashboard" />;
    }
    return (
      <>
        <Row type="flex" justify="start">
          <Col xs={30} sm={30} md={30} lg={30} xl={12}>
            <div style={{ height: "auto", display: "flex" }}>
              <img
                src={wallStreet}
                style={{
                  width: "100%",
                  maxHeight: "100%",
                  padding: "0em 0em 0em 0em"
                }}
              />
            </div>
          </Col>
          <Col xs={30} sm={30} md={30} lg={30} xl={12}>
            <div
              style={{
                backgroundColor: "#000000",
                backgroundSize: "auto",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "2em"
              }}
            >
              <div
                style={{
                  height: "auto",
                  width: "25em",
                  padding: "2em",
                  backgroundColor: "white",
                  borderRadius: "2em"
                }}
              >
                <Form
                  name="normal_login"
                  className="login-form"
                  initialValues={{ remember: false }}
                  onFinish={this.onFinish}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not valid E-mail!"
                      },
                      { required: true, message: "Please input your Email!" }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Email"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Please input your Password!" }
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="Password"
                    />
                  </Form.Item>
                  <Form.Item>
                    <a className="login-form-forgot" href="">
                      Forgot password
                    </a>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Log in
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={this.showModal}>
                      Register
                    </Button>
                  </Form.Item>
                </Form>

                <Modal
                  title="Register"
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  footer={[
                    <Button key="Cancel" onClick={this.handleCancel}>
                      Exit
                    </Button>
                  ]}
                >
                  <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: false }}
                    onFinish={this.createAccounts}
                  >
                         <Form.Item
                      name="name"
                      rules={[
                        {
                          min: 5, message: 'Username must be minimum 5 characters.'
                        },
                        { required: true, message: "Please input your name!" }
                      ]}
                    >
                       <Input
                        prefix={
                          <GlobalOutlined className="site-form-item-icon" />  
                        }
                        placeholder="Username"
                      />

                    </Form.Item>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "The input is not valid E-mail!"
                        },
                        { required: true, message: "Please input your Email!" }
                      ]}
                    >
                      <Input
                        prefix={
                          <UserOutlined className="site-form-item-icon" />
                        }
                        placeholder="Email"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Password!"
                        }
                      ]}
                    >
                      <Input
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder="Password"
                      />
                    </Form.Item>
                    <Form.Item
                      name="confirmpassword"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Password!"
                        }
                      ]}
                    >
                      <Input
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder="Password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                      >
                        Register
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </div>
            </div>
          </Col>
        </Row>
        <Row type="flex">
          <Col>
            <div className="center" style={{ backgroundColor: "#C44900", height: "100%", color: "white", fontSize: "1.25em",listStylePosition: "inside"}}>
              Welcome to StockScore, A place where you can compete with your money making skills.<br/><br/>
              <u>Getting started guide</u>
              <ol>
              <li>
                  Register an account. It is completely free!
              </li>
              <li>
                Search for the stocks that intrested you!
              </li>
              <li>
                Vote, comment and start building rep!
              </li>
              </ol>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default Home;
