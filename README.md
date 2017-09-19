# Custom Component Service Starter App (Express.js)

This Component Service implementation is based on Express.js. It includes the following files:

- `package.json` --  This is a standard `package.json` file.
- `index.js` --  The main Javascript file. It implements the Bots Component Service REST API by  delegating most of the functions to the `shell.js` object.
- `registry.js` --  Lists the custom components that are managed by a component service.
- `shell.js` --  A utility object that's shipped with Bots that both finds and invokes custom components.
- `examples/say_hello.js` --  An example custom component implementation.
- `examples/say_hello.json` --  An exported bot that uses the `examples/say_hello.js` custom component.

## How To Start the Server ##

1. Run npm install on your module.
1. Run node index.js to start the server.
1. In the Bot Builder, create a new bot by importing the `examples/say_hello.json` file. Be sure to configure the custom component service connection parameters. The username/Password is MyTestUser/MyTestPassword.