# Meal Planner

This is a public repository that I use to help my family plan meals. It utilizes various Firebase services for hosting, authentication, and database management.

Because it's all hosted on firebase, everything can be done from one repository. I don't need to worry about backend, hosting, database, or auth.

## Features

- Firebase Hosting: The app is hosted using Firebase Hosting, allowing easy deployment and access to the meal planner application.

- Firebase Cloud Functions: Firebase Cloud Functions are used to handle server-side logic and perform tasks such as sending notifications or processing data.

- Firebase Authentication: Firebase Authentication is used to manage user authentication and access control for the meal planner application.

- Firebase Realtime Database: The meal planner application utilizes Firebase Realtime Database to store and retrieve meal plans, recipes, and other related data.

- All built on a typescript Vite React.js application

## Getting Started

If you would like to spin up your own instance of the meal planner application, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/navarrotech/meal-planner.git
    ```

2. Install dependencies:

    ```bash
    cd meal-planner
    yarn install
    ```

3. Configure Firebase:

    - Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com).
    - Enable Firebase Hosting, Firebase Cloud Functions, Firebase Authentication, and Firebase Realtime Database for your project.
    - Obtain the Firebase configuration values (apiKey, authDomain, projectId, etc.) from the Firebase project settings, and create a `firebase.json` file in the root of the project containing these details.

4. Running locally in development:

    ```bash
    yarn run dev
    ```

5. Build and deploy the application:

    ```bash
    yarn run build
    firebase deploy
    ```

6. Access the deployed application:

    Once the deployment is complete, you can access the meal planner application using the provided Firebase Hosting URL.

## Contributing

Feel free to contribute to this project by submitting pull requests or reporting issues. Your contributions are greatly appreciated!

## License

This project is licensed under the [MIT License](LICENSE).