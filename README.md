# Tv-Junkie

### App for tracking shows

A personal pet project/portfolio.

- https://www.tv-junkie.com - live website.
- https://youtu.be/eVpnWltTYf0 - a short video presentation with audio commentary of the functionality of the app.

Technical information below.

#### Frontend

- React with React Router
- Almost every component is functional with heavy usage of reusable custom hooks. Most of the components were refactored from class components.
- For state management I use React Context, plus useReducer hook where the state are too complex and/or where one state may be dependent on another. For example in the Shows page.
- Almost every component in TypeScript. I think I really need type checking in this app, because for the data about shows/movies I use external API and do a lot of data transformation in formats I need for the backend. A whole app was refactored to TS from regular JavaScript.
- Anywhere where I make frequent API calls (like in search bar or in infinite scrolling) there's wrapper debounce function which prevents unnecessary API calls on every keystroke or scrolling, which could be a lot. Important to keep in mind while using debounce and similar functions in functional components, that on every render there will be completely new debounce function, so one of the approaches is to wrap it in useCallback hook to preserve it between renders.
- The star rating component could be easily implemented to basically everything in the database. The star amount can be change to anything.
- For styles I use preprocessor SCSS.
- In many instances I use Optimistic UI approach for instant feedback to the users.

#### Backend

- Firebase and their Realtime Database for data storage
- https://www.themoviedb.org/documentation/api - for content data
- Data architecture in the Realtime Database done by me
- Google Analytics naturally comes with Firebase project from the box

#### Hosting

- AWS amplify
- Continuous deployment from Github repository. Development branch set up to deploy to password protected development domain and master branch to the main domain.

If you add enough shows the first load of the user data could be slow. This is a consequence of the conscious decision. I'm doing some backend work on the frontend, because in order to do it the right way I would need to spend some download traffic which is not free. And I don't have enough free traffic on the default Firebase plan.
I know that this is not how it is supposed to be. Backend work should be on the backend. But it is a workaround to save traffic and it allowed me to better grasp the importance of the right communication between front and back ends. Also it gave me experience working with a lot of asynchronous code, better understanding and importance of efficient data architecture and overall comprehension by doing it consciously wrong why it's important to do it right and what benefits it will produce.

For a detailed explanation what exactly and why I'm doing on front and not backend we can have a conversation.

##### Some features that would be easy and straightforward to implement which I won't be doing at the pet project, cause I would learn very little from developing them or is mainly backend work

- Page for specific episode of the show with the commentary section. This section could have a tree structure, likes/dislike, sort by options, image attachments, real time update (new comments would appear without refresh, or by clicking "Show new comments" depending on the UI decision)
- Last activity friends list. Requires mostly backend work and efficient data structure.
- Awards for some activity like watched 5 shows, 1 year old account, etc. Pretty straightforward from front and back end point of view.
- List of shows based on the statistics acquired from users like: average rating, users watching, etc. Considerable amount of backend work requires and from frontend view filtering all this would be pretty simple, IF backend would allow good filtering capabilities.
- A lot of settings in the profile page could be implemented like: language, light/dark mode and a lot of personal preferences about what and how to show in the UI.
- Favourite shows, notes to episodes/shows and similar features are easily implemented.

##### Things I want to do, that would be interesting and challenging

- Friends functionality with direct messages like a chat. Requires some thought of how to structure data efficiently at the backend side. Firebase has an out of the box websocket real time connection which I already use a lot. At the frontend side I expect a lot of small things that need to be worked through, so the chat experience would be smooth as people get used to. Functionality should be as users would expect in the chat app like edit/delete, reply to messages, etc.

Please don't try to run the app locally, the file with environmental variables is not uploaded to the github.

Thank you for reading.
