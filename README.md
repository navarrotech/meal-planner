# Meal Planner

This is a public repository that I use to help my family plan meals. The idea is that you can spin up this repository to plan your family's meals, and any user accounts can view the same family's meals.

It was built to have one repository per family, and all registered users have access to that family's meals. View security notes below for best practices.

It utilizes various Firebase services for hosting, authentication, and database management.

Because it's all hosted on firebase, everything can be done from one repository. Because the application is so simple, I don't need to worry about backend servers, website hosting, database, or auth.

## Features

- Firebase Hosting: The app is hosted using Firebase Hosting, allowing easy deployment and access to the meal planner application.

- Firebase Cloud Storage: The app uses cloud storage to optionally add images to your known recipes.

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
    - Enable Firebase Hosting, Firebase Cloud Storage, Firebase Authentication, and Firebase Realtime Database for your project.
    - Obtain the Firebase configuration values (apiKey, authDomain, projectId, etc.) from the Firebase project settings, and create a `firebase-credentials.json` file in the root of the project containing these details.

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

## Security notes

If you want to host this on the cloud using Firebase Hosting (like I do), you may not want just anyone signing up and viewing your family's meal plan. For me, I just wanted me and my partner to sign up and only the two of us should have access to the website. To handle this, firebase auth provides an option to prevent sign-ups in the [firebase console](https://console.firebase.google.com/). To get there, navigate to Authentication on the sidebar, and find the "settings" tab. Under "User Actions" you can see a checkbox for "Enable create (sign up)." I recommend signing up yourself and anyone else you want, then disabling this.

## Contributing

Feel free to contribute to this project by submitting pull requests or reporting issues. Your contributions are greatly appreciated!

## License

This project is licensed under the [MIT License](LICENSE).