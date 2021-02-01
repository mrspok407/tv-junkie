# Tv-Junkie

### App for tracking shows

A personal pet project/portfolio created with React and Firebase.

## Demo

- https://www.tv-junkie.com - live website.
- https://youtu.be/eVpnWltTYf0 - a short video presentation with an audio commentary of the functionality of the app.

## Table of Contents

- [Features](#Features)
- [Main technologies](#Main technologies)
- [Frontend](#Frontend)
- [Backend](#Backend)
- [Hosting](#Hosting)
- [Some caveats](#Some caveats)
- [Easy features to implement](#Easy features to implement)
- [Challenging features](#Challenging features)

## Features

- Keep track of your watching or finished shows
- Check and rate episodes you watched
- See the list of all episodes you haven't watched
- Dates of upcoming episodes
- Search shows and movies by the parameters or directly

## Main technologies

- React with functional components
- Firebase Realtime database
- TypeScript
- SCSS
- AWS Amplify hosting

## Frontend

- React with React Router
- Almost every component is functional with heavy usage of reusable custom hooks. Most of the components were refactored from class components.
- React Context used for state management. UseReducer hook helps with the components where the state is too complex and/or where one state may be dependent on another. For example on the Shows page.
- Almost every component is in TypeScript. It helps to keep track of the data structure received from an external API and in what formats should it be transformed for the backend. A whole app was refactored to TS from regular JavaScript.
- For optimization of frequent API calls, like in search bar or infinite scrolling, the wrapper debounce function is used. It prevents a lot of unnecessary API calls on every keystroke or scrolling. Important to keep in mind when using debounce and similar methods in functional components, that on every render there will be a completely new debounce function. One of the approaches to deal with it is to wrap it in the useCallback hook to preserve it between renders.
- SCSS preprocessor is used for styles.
- Optimistic UI approach is applied in many places for instant feedback to the users.

## Backend

- Firebase and their Realtime Database for data storage.
- https://www.themoviedb.org/documentation/api - for content data.
- Сustom data architecture and Firebase rules are developed for Realtime Database.

## Hosting

- AWS amplify
- Continuous deployment from the Github repository is configured. Development branch set up to deploy to the password-protected development domain and the master branch to the main domain.

### Some caveats

---

If a user has a considerable amount of shows in their database the first data load could be slow. This is a consequence of conscious decision. Some backend work is done on the frontend because to do it the right way a substantial amount of download traffic needs to be used which is not free.

This is not how it is supposed to be. Backend work should be on the backend. But it is a workaround to save traffic and it allowed me to better grasp the importance of the right communication between the front and back end. Сonsciously doing it wrong gave me the experience working with a lot of asynchronous code, better understanding, and the importance of efficient data architecture and overall comprehension of why it's important to do it right and what benefits it will produce.

For a detailed explanation of what exactly and why I'm doing on front and not backend we can have a conversation.

### Easy features to implement

---

Some features that would be easy and straightforward to implement which I won't be doing at the pet project. I would learn very little from developing them or is mainly backend work.

- The page for a specific episode of the show with the commentary section. This section could have a tree structure, likes/dislikes, sort by options, image attachments, real-time update (new comments would appear without refresh, or by clicking "Show new comments" depending on the UI decision)
- Recent activities from friends. Requires mostly backend work and efficient data structure.
- Awards for some activity like watched 5 shows, 1 year old account, etc. Pretty straightforward from the front and back end point of view.
- List of shows based on the statistics acquired from users like average rating, users watching, etc. A considerable amount of backend work requires and from the frontend side filtering all this would be pretty simple, **IF** backend would allow good filtering capabilities.
- A lot of settings on the profile page could be implemented like language, light/dark mode, and a lot of personal preferences on what and how to show in the UI.
- Favourite shows, notes to episodes/shows, and similar features are easily implemented.

### Challenging features

---

Things I want to do, that would be interesting and challenging

- Friends functionality with direct messages in a chat form. Requires some thought of how to structure data efficiently at the backend side. Firebase has an out of the box WebSocket real-time connection which is already used a lot throughout the app.

  On the frontend side, I expect a lot of small things that need to be worked through, so the chat experience would be smooth as people get used to it. Functionality should be as users would expect in the chat app like edit/delete, reply to messages, etc.

---

Please don't try to run the app locally. The file with environmental variables is not uploaded to Github.

Thank you for reading.
