## Build your own local network chat with React and Typescript!

We'll be building a bare-bones version of this, hosted on your very own computer.
![](tutorial/live-chat.png)

> [!TIP]  
> If you’re stuck, check out the reference implementation in the same repo! Its feature scope is a bit broader than what's covered here, so don't worry if you don't understand everything on first pass.

# Table of contents

### [Overview](#overview)

### [Backend](#backend)

### [Frontend (UI)](#writing-the-frontend-ui-no-styles-just-basic-elements)

### [Frontend (interactivity)](#making-the-frontend-interactive)

### [Deploying your App](#deploying-your-app-1)

## Overview

We’ll be writing a private network anonymous chat app from scratch! At a high level, both the backend and frontend will be hosted under your private network. Users can chat through the frontend interface when on the same network. (Think: Minecraft LAN servers) The messages that they send get propagated to the backend through a websocket, which is then responsible for sending the message to all active websocket connections. The frontend will be built with React and Typescript, and the backend will be Typescript.

## Prerequisites

Ensure you have Node.js installed on your device. (run `npm -v` to check)
Familiarity with React and Typescript is recommended.

## Tutorial

1. We’ll be structuring our code with two folders:
   ![](tutorial/folder.png)

## Writing the backend (functionality)

1.  `cd` into the backend folder, and run `npm init -y`, which creates a `package.json` file
1.  Run `npm i socket.io tsx` to install socket.io (which we use for our websockets) and tsx (to start up our server). You should now see a `node_modules` folder.
1.  Create a file called `server.ts` (you can call it whatever you want). Let's set up our websocket and server now! Start with these imports:

    ```ts
    import http from "http";
    import { Server } from "socket.io";
    ```

1.  Let's initialize the http server and websocket

    ```ts
    const httpServer = http.createServer();
    const io = new Server(httpServer, { cors: { origin: "*" } });
    ```

> [!TIP]
> It's good practice to use `const` when declaring variables in `js` or `ts` that you know won't be re-assigned.

5.  We’ll need to be able to send and receive messages from clients. Here are some hints:

    - To listen to a websocket connection, we can call `io.on(“connect”,(socket)=>{})` where the second argument is a callback that takes in the newly created connection.

    - Using this `socket`, we can run `socket.on(“message”,(payload)=>{})` to receive messages
    - `io.emit(“message”, payload)` will send the payload to all subscribers.

> [!NOTE]
> Note that payload can be any type, even an js object! You can type the payload however you wish. (just make sure to re-use the same type for the frontend)

6.  Let's mount the server on port 8080 as follows.
    ```ts
    httpServer.listen(8080, "0.0.0.0", () =>
      console.log("listening on " + JSON.stringify(httpServer.address()))
    );
    ```
7.  To run the server, we’ll add a `start` command script with the value `tsx server.ts` to `package.json`.
    ```json
    + "scripts": { "start": "tsx server.ts" }
    ```
8.  We can now run the server by running `npm run start` in the terminal. You should see an output similar to the following:
    ![](tutorial/backend-output.png)

That’s it for the backend. Your chat is now ready to handle clients!

## Writing the frontend UI (no styles, just basic elements)

1. We’ll be using `vite` to bootstrap our frontend React application. `cd` into `frontend` and run `npm create vite@latest .` Select React and TypeScript when prompted.

1. Now, run `npm install` to install vite, react, and several linting libraries

> [!NOTE]
> check the dependencies in `package.json` for the full list if you're curious

3. We'll need a couple basic elements. To make our lives easier, let's delete everything in `index.css` and `App.css`. Our code will live in `App.tsx` for the most part.

> [!NOTE]
> To be more specific, we're building a client-side single page web app

4. Run `npm run dev` to see the output. You should see something like this:

   ![](tutorial/starter-ui.png)

> [!TIP]
> Vite (the framework we're using) supports hot reload, meaning that you don't need to restart the server in order to see your frontend changes. Make a change and save to see this in action!

5. In `App.tsx`, we're going to need a state for our messages and a form for accepting user messages. Don't worry about making it interactive just yet.

   > The function `App` that you see in `App.tsx` is called a React (functional) component. For a primer on handling state in components, see [here](https://react.dev/reference/react/useState#usage). Also note that in typescript, `useState` allows you to pass in an additional type argument using angle brackets so that the state is typed correctly. For example, `const [array, setArray] = useState<string[]>([])` allows typescript to know that `array` is of type `string[]`.

    <details>
     <summary>See here for a reference solution</summary>

   ```ts
   import { useState } from "react";
   import "./App.css";

   function App() {
     const [messages, setMessages] = useState<string[]>(["hi", "bye"]);
     return (
       <>
         <ul>
           {messages.map((message) => (
             <li>{message}</li>
           ))}
         </ul>
         <form>
           <input type="text" placeholder="Your message here" />
         </form>
       </>
     );
   }
   export default App;
   ```

</details>

## Making the frontend interactive

1. Great! We’ll now need to initialize our websocket connection and handle sending and receiving messages. To start, run `npm install socket.io-client` in the `frontend` folder.
1. Since we only need one global `socket` state, let's add these two lines outside of the `App` component. (We're working in `App.tsx`).

   ```ts
   import { io } from "socket.io-client";
   const socket = io("http://localhost:8080");
   ```

> [!CAUTION]
> If you want other people to log on to the chat app on their devices, be sure to replace `localhost` with your actual IP address. See the Deploying Your App section for more details.

3. To receive socket messages, use the `socket.on("message", onMessage);` to subscribe and `socket.off("message", onMessage);` to unsubscribe. (where `onMessage` is a callback function that takes in the message as its first argument). Since we want to subscribe on component mount, let's do so in a `useEffect` with an empty dependency array inside the `App` component. See React's [useEffect documentation](https://react.dev/reference/react/useEffect) for more details.

1. Once we received a message, we'll need to update the message state to trigger a component re-render. As a hint, `setXXX()` can also accept a callback function where the input is the old state and the returned value is the new state.
1. To handle form submissions, make sure your input box is wrapped in a `form` component. We'll then add the following:
   ```jsx
   <form
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.target as HTMLFormElement);
          socket.emit("message", formData.get("message")); // "message" is the name attribute for the input element (you'll need to set the "name" attribute yourself)
        }}
      >
   ```
1. Now, assuming your backend is running, we should have something like the following!
   <video style="width:100%" controls src="tutorial/demo.mov" type="video/mp4"/>

    <details>
     <summary>See here for a reference solution</summary>

   ```ts
   import { useEffect, useState } from "react";
   import "./App.css";
   import { io } from "socket.io-client";
   const socket = io(`${window.location.hostname}:8080`);

   function App() {
     const [messages, setMessages] = useState<string[]>(["hi", "bye"]);
     useEffect(() => {
       const onMessage = (payload: string) => {
         setMessages((messages) => [...messages, payload]);
       };
       socket.on("message", onMessage);
       return () => {
         socket.off("message", onMessage);
       };
     }, []);
     return (
       <>
         <ul>
           {messages.map((message) => (
             <li>{message}</li>
           ))}
         </ul>
         <form
           onSubmit={(ev) => {
             ev.preventDefault();
             const formData = new FormData(ev.target as HTMLFormElement);
             socket.emit("message", formData.get("message"));
           }}
         >
           <input type="text" placeholder="Your message here" name="message" />
         </form>
       </>
     );
   }

   export default App;
   ```

</details>

## Deploying your app!

1. For the frontend, make the following change in `package.json` and then restart the server.
   ![](tutorial/vite-host.png)
1. Change the frontend WebSocket address to point to the same IP as the frontend URL (you can hardcode it or access it dynamically with `window.location.hostname`)
1. Now, copy the frontend link with your IP (not the localhost one) to share the chat app with your friends!

## Bonus Quality of life tweaks

Have some extra time? Here are some extensions that build upon what we've just covered.

- Clear the message input once the message sends
- Add a state/indicator for whether or not the websocket connection is active.
- Style the site to be more user-friendly
- Scroll to bottom on new message
- Allow users to put in username
- Put the message in its own div so you can copy-paste the message without copying the username

## Bonus Nontrivial features

- Encrypt messages
- Save messages
- Indicator for the number of people online
- Notifications when someone joins or leaves the chat
- Chat rooms (aka socket namespaces)
