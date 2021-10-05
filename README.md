# Tv-Junkie

[English version](#English-version)

### Приложение для трэкинга сериалов

Персональный проект/портфолио, создано с помощью React и Firebase.

## Демо

- https://www.tv-junkie.com - сайт.
- https://www.youtube.com/watch?v=euGWPi97aeg - короткий обзор функциональности с аудио комментариями
- https://www.youtube.com/watch?v=ZsQKTjKIewI - отдельный обзор функционалности [друзей и чата](#Чат)

## Содержание

- [Функционал](#Функционал)
- [Основные технологии](#Основные-технологии)
- [Фронтэнд](#Фронтэнд)
- [Бэкэнд](#Бэкэнд)
- [Хостинг](#Хостинг)
- [Лёгкий для разработки функционал](#Лёгкий-для-разработки-функционал)
- [Сложный функционал](#Сложный-функционал)
- [Чат](#Чат)

## Функционал

- Отслеживание выходящие или завершённые сериалы
- Отмечать и ставить рейтинг сериям
- Просмотр списка всех непросмотренных серий отмеченных сериалов
- Календарь выхода новых серий
- Поиск конкретных сериалов и фильмов или по параметрам
- Функционал друзей и система личных сообщений в виде полноценного чата один на один так и групповой чат. [Подробнее](#Чат)

## Основные технологии

- React на функциональных компонентах и хуках
- Firebase облачная serverless база данных
- React Context + useReducer для стейт менеджмента
- TypeScript
- SCSS
- AWS Amplify хостинг

## Фронтэнд

- React c React Router.
- Почти все компоненты функциональные с большим использованием собственных хуков. Полностью рефакторено с классовых.
- React Context использован для стейт менеджмента. useReducer хук используется в местах где стейт достаточно сложный, например на странице Сериалов. В чате Context + useReducer используется как замена Redux. Там очень сложный, постоянно изменяющийся, зависящий друг от друга стейт. [Подробнее про чат](#Чат).
- Почти вся код база на TypeScript. Полностью рефактарено с JavaScript.
- Для оптимизации частых запросов к API, как в поиске или бесконечной прокрутке, используется debounce функция. Предотвращает лишние запросы на каждое нажатие клавиши или скроллинг. В функциональных компонентах debounce и подобные методы при ререндере будут совершенно новыми функциями. Важно оборачивать их в useCallback хук, чтобы они сохранялись между рендарами.
- SCSS препроцессор для стилей.
- Optimistic UI использован во многих местах для ощущения мгновенной отзывчивости интерфейса.

## Бэкэнд

- Firebase и их Realtime Database для хранения данных.
- https://www.themoviedb.org/documentation/api - API сериалов
- Собственная архитектура данных и Firebase правила разработаны для Realtime Database.

## Хостинг

- AWS amplify.
- Настроена непрерывная интеграция с Github репозиторием. Ветка разработки установлена на деплой в защищённый домен, мастер ветка на основной домен.

## Лёгкий для разработки функционал

Некоторые функции легкие для разработки, без особых подводных камней, которые я не буду внедрять для персонального проекта. Так как они не вызовут особых трудностей или это в основном бэкэнд работа.

- Отдельная страница для каждого эпизода сериала с секций комментариев. Она может выглядить древовидной, с лайк/дислайками, сортировкой, прикреплением изображений, обновлением комментариев в реальном времени и т.п. Примерно 50 на 50 фронтэнд и бэкэнд работа.
- Недавняя активность друзей. В основном бэкэнд работа и грамотно продуманная архитектура данных для NoSQL базы данных.
- Награды за активность, например за кол-во просмотренных сериалов, возраст аккаунт и т.д. Довольно прямолинено со стороны фронтаэнда и бэкэнда.
- Списки контента на основе статистики от пользователей, такой как: средний рейтинг, кол-во смотрящих и т.д. Большая работа для бэкэнда. Со стороны фронтэнда только фильтрация, которая будет зависить от качества API бэкэнда.
- Очень много настроек в профиле: язык, тема, персональные настройки интерфейса и т.д.
- Любимые сериалы, заметки к эпизодам/сериалам и подобный функционал достаточно прямолинеен.

## Сложный функционал

Интересный функционал который я хочу сделать и потребует достаточных усилий.

Done

- ~~Функционал друзей с приватными сообщениями в чат форме. Потребует значительной бэкэнд работ и разработки грамотной архитектуры данных. В Firebase есть "из коробки" хороший API с WebSocket соединением подходящий для чат приложений. Который я и так использую в разных местах всего приложения.~~
- ~~На фронтэнд стороне я ожидаю очень много мелочей которые нужно будет проработать. Функционал интерфейса должен быть привычный для крупных чатов, редактирование/удаление сообщений и т.д.~~

## Чат

Полноценный функционал друзей и сообщений в форме чата. Приватные чаты один на один и групповые чат комнаты. Быстрый, масштабируемый с богатыми UI возможностями. [Обзор функциональности](#https://www.youtube.com/watch?v=ZsQKTjKIewI)

#### Фронтэнд

- Стэйт менеджмент достаточно сложный. Из-за динамического характера чат приложения, где стейт постоянно меняется и очень часто зависит от другого стейта. Несколько WebSocket соединений от Firebase открыты одновременно в колбэке которых асинхронно могут меняться разные части стэйта. React Context с useReducer использован для всего чат приложения.
- В некоторых местах useRef'ы использованы в WS соединениях вместо стейта для оптимизации. Например для изменения непрочитанных сообщений при скролле данные с базы идут в ref, чтобы избежать большого кол-ва ререндеров. Глобальный стейт непрочитанных сообщений изменяется другими путями.
- IntersectionObserver использован для определения, когда непрочитанное сообщение появляется в поле зрения.
- Бесконечная прокрутка сообщений как вверх так и вниз. Показывается только ограниченное количество сообщений, как и происходит постепенная загрузка новых. Реализовано с помощью правильного изменения диапазонов индексов в общем массиве сообщений.
- Большое количество собственных хуков использовано по всему приложению для повторного использования функциональности и композиции в общем и целом.
- useLayoutEffect хук особенно полезен для ререндеров, когда позиция скролла должна измениться, чтобы избежать "прыжка" окна. Необходимые вычисления будут произведены до ререндера.
- Окно ввода сообщений сделано с contenteditable атрибутом и всё, что касается редактирования (переход на след. строку с shift+enter (не enter), выделение текста, удаление текста, позиция курсора и т.д.) закодено с нуля. Настройки по умолчанию при contenteditable не подходили к тому, что мне было необходимо.
- Модал окна при удаление сообщений или друзей легко настраиваются и подойдут под любой компонент.
- Собственный хук использован для ошибок от базы данных, который покажет всплывашку с ошибкой.
- Для операций записи в базу данных соблюдён баланс между фронтэндом и облачными функциями бэкэнда (см. ниже). Так что воспринимаемая скорость интерфейса будет достаточно высока там, где это важно и более медленна, где не столь заметна (там использованы облачные функции).
- Операции записи в разные места базы данных делаются с помощью одного запроса, чтобы избежать "race conditions" и других проблем.
- Много всего другого.

#### Бэкэнд

- Денормализация использована во многих местах для более эффективных операций чтения в NoSQL баз данных (таких как Firebase).
- Много функций вынесены в облачные функции Firebase'а, которые запускаются на сервере: создание групп, добавление друзей, последняя активность и другие. Это снимает с фронтэнда большую ношу и в общем и целом автоматизирует много вещей. В облачных функциях Firebase'а есть "холодный старт" функции это означает, что если ее долго не использовали первый старт будет медленный. Это не должно быть проблемой в продакшане, т.к. там эти функции будут запускаться достаточно часто.

---

Не пытайтесь запустить сайт локально. Файл с переменными окружения не загружен на Github.\
Пожалуйста обращайте внимание на дату последних крупных изменений в конкретном файле исходного кода. Так как там возможно требуется рефакторинг и этот старый код может не отражать корректно мой текущий уровень.

Спасибо за чтение.

## English version

### App for tracking shows

A personal pet project/portfolio created with React and Firebase.

## Demo

- https://www.tv-junkie.com - live website.
- https://www.youtube.com/watch?v=jQvER-qlpCY - a short video review with an audio commentary of the functionality of the app.
- https://www.youtube.com/watch?v=JrseNlKRhZo - review of [chat functionality](#Chat)

## Table of Contents

- [Features](#Features)
- [Main technologies](#Main-technologies)
- [Frontend](#Frontend)
- [Backend](#Backend)
- [Hosting](#Hosting)
- [Easy features to implement](#Easy-features-to-implement)
- [Challenging features](#Challenging-features)
- [Chat](#Chat)

## Features

- Keep track of your watching or finished shows
- Check and rate episodes you watched
- See the list of all episodes you haven't watched
- Dates of upcoming episodes
- Search shows and movies by the parameters or directly
- Friends functionality and direct message system in a form of full-fledged chat application. Direct and group chat rooms. [More details](#Chat)

## Main technologies

- React with functional components
- Firebase Realtime database
- React Context + useReducer for state management
- TypeScript
- SCSS
- AWS Amplify hosting

## Frontend

- React with React Router.
- Almost every component is functional with heavy usage of reusable custom hooks. Most of the components were refactored from class components.
- React Context used for state management. UseReducer hook helps with the components where the state is too complex and/or where one state may be dependent on another. For example on the Shows page.
- Almost every component is in TypeScript. It helps to keep track of the data structure received from an external API and to what formats should it be transformed for the backend. A whole app was refactored to TS from regular JavaScript.
- For optimization of frequent API calls, like in search bar or infinite scrolling, the wrapper debounce function is used. It prevents a lot of unnecessary API calls on every keystroke or scrolling. Important to keep in mind when using debounce and similar methods in functional components, that on every render there will be a completely new debounce function. One of the approaches to deal with it is to wrap it in the useCallback hook to preserve it between renders.
- SCSS preprocessor is used for styles.
- Optimistic UI approach is applied in many places for instant feedback to the users.

## Backend

- Firebase and their Realtime Database for data storage.
- https://www.themoviedb.org/documentation/api - for content data.
- Сustom data architecture and Firebase rules are developed for Realtime Database.

## Hosting

- AWS amplify.
- Continuous deployment from the Github repository is configured. Development branch set up to deploy to the password-protected development domain and the master branch to the main domain.

## Easy features to implement

Some features that would be easy and straightforward to implement which I won't be doing at the pet project. I would learn very little from developing them or is mainly backend work.

- The page for a specific episode of the show with the commentary section. This section could have a tree structure, likes/dislikes, sort by options, image attachments, real-time update (new comments would appear without refresh, or by clicking "Show new comments" depending on the UI decision)
- Recent activities from friends. Requires mostly backend work and efficient data structure.
- Awards for some activity like watched 5 shows, 1 year old account, etc. Pretty straightforward from the front and back end point of view.
- List of shows based on the statistics acquired from users like average rating, users watching, etc. A considerable amount of backend work requires and from the frontend side filtering all this would be pretty simple, **IF** backend would allow good filtering capabilities.
- A lot of settings on the profile page could be implemented like language, light/dark mode, and a lot of personal preferences on what and how to show in the UI.
- Favourite shows, notes to episodes/shows, and similar features are easily implemented.

## Challenging features

Things I want to do, that would be interesting and challenging

Done

- ~~Friends functionality with direct messages in a chat form. Requires some thought of how to structure data efficiently at the backend side. Firebase has an out of the box WebSocket real-time connection which is already used a lot throughout the app.~~

- ~~On the frontend side, I expect a lot of small things that need to be worked through, so the chat experience would be smooth as people get used to it. Functionality should be as users would expect in the chat app like edit/delete, reply to messages, etc.~~

## Chat

Full-fledged friends functionality and messaging in a chat form. Both private and group chat rooms. Fast, scalable, with rich UI capabilities. [Review of functionality](#https://www.youtube.com/watch?v=JrseNlKRhZo)

#### Frontend

- The state management is very complex. Because of the dynamic nature of the real-time chat application, where the state is constantly changing and frequently depending on each other. Several WebSocket connections from Firebase are open simultaneously and all could change state asynchronously. So React Context with useReducer is used for state management of the whole chat application.
- In some parts useRef's are used in WS connections instead of state for optimization purposes. For example for changing unread messages when scrolling the data from the server goes to ref to avoid rerenders. The global state of unread messages updates in different ways.
- IntersectionObserver is used for detecting unread messages.
- Infinite scrolling is implemented in both directions, up and down. Showing only a handful of messages for efficiency. Implemented by properly changing the range of indexes in the message array.
- A lot of custom hooks are used throughout the application for functionality reusability and overall composition structure.
- useLayoutEffect is particularly useful for rerenders when scroll position would change to avoid the "jump" of the scroll. It would do necessary calculations before rerendering dom elements.
- Message input made with contenteditable attribute and everything related to editing messaging (go to next line with shift + enter (not enter), select text, delete text, the position of the insertion point, etc) is coded from the ground up. Because default settings of all this behavior are not suitable as I need.
- Modal boxes when deleting messages or friends are fully reusable and very easily adjustable.
- Custom hook used for all the errors from the database, that will show pop up if something goes wrong. Easily integrated to any needed component.
- For write operations to the database there is a balance between frontend and backend cloud functions (see below). So the perceived speed of the UI would be sufficiently high in places where it's important, and slower where it's not noticeable (cloud functions used there).
- Write operations to different paths of database done with one call, so there won't be any race conditions and other complications.
- A lot of other stuff

#### Backend

- Denormalization is used in many cases for efficient read operations in NoSQL-like databases (like Firebase).
- A lot of functionality moved to Firebase Cloud Functions, which are run on the server: creating group, adding friends, last activity updates, etc. It makes the frontend much simpler. And overall automate a lot of things. Bear in mind there is a thing called "cold start" with these functions, which means the first invocation after some time would be slow. In a real production application, it shouldn't be a problem, cause these functions would run frequently.

---

Don't try to run the app locally. The file with environmental variables is not uploaded to Github.\
Please keep in mind the date of the last significant changes in the source files. Since there may be a need for refactoring and this old code may not reflect my current level truthfully.

Thank you for reading.
