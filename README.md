# SoundScout

SoundScout is a cross-platform mobile application designed to help users discover new music based on nearby listeners, combating the "music slump." The app leverages location-based social discovery and real-time interaction to promote music exploration.

## Table of Contents
- [Project Setup Instructions](#project-setup-instructions)
- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Install Dependencies](#install-dependencies)
- [Running the App](#running-the-app)
- [Authors](#authors)
- [Contributions](#contributions)

## Project Setup Instructions

Follow these steps to set up the project on your local machine. Instructions cover both macOS and Windows.

### Prerequisites

- **Node.js** (version 14 or later): [Download and install Node.js](https://nodejs.org/).
- **Git**: Ensure Git is installed on your machine. You can check this by running `git --version` in your terminal.
- **Expo Go App** (for testing on mobile): Download the [Expo Go](https://expo.dev/client) app on your iOS or Android device.

#### Additional Setup for Windows Users

- **Install Chocolatey** (optional): Chocolatey is a package manager for Windows and can simplify the installation of dependencies.

  - To install Chocolatey, run the following command in PowerShell as Administrator:
    ```powershell
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```

- **Install Watchman** (optional but recommended): If using a Windows machine, you may not need Watchman, but you can install it using Chocolatey if you encounter file-watching issues.

  ```powershell
  choco install watchman
  ```

#### Additional Setup for macOS Users

- **Homebrew**: Install Homebrew, the package manager for macOS (if not already installed). Run this command in the terminal:

  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- **Install Watchman**: On macOS, Watchman is often required for optimal performance.

  ```bash
  brew install watchman
  ```

### Clone the Repository

1. Open your terminal (macOS) or Command Prompt/PowerShell (Windows).
2. Clone the repository:
   ```bash
   git clone https://github.com/fati-m/SoundScout.git
   ```
3. Navigate into the project folder:
   ```bash
   cd SoundScout
   ```

### Install Dependencies

Once inside the project folder, install the project dependencies using npm:

```bash
npm install
```

This will install all necessary packages, including `react-navigation` and other dependencies.

## Running the App

#### 1. Start the Expo Development Server

To start the development server, run:

```bash
npx expo start
```

This command will open the Expo Developer Tools in your browser, displaying a QR code for testing on mobile devices.

#### 2. Test on a Mobile Device

- Open the **Expo Go** app on your iOS or Android device.
- Scan the QR code in the Expo Developer Tools to load the app on your device.

#### 3. Running on a Simulator (Optional)

If you'd prefer to test on an emulator, follow these steps:

- **macOS (iOS Simulator)**:

  - Install Xcode from the App Store if not already installed.
  - Start the iOS simulator from Expo by pressing `i` in the terminal after running `npx expo start`.

- **Windows (Android Emulator)**:

  - Install Android Studio and set up an Android Virtual Device (AVD).
  - Start the Android emulator from Expo by pressing `a` in the terminal after running `npx expo start`.

### Troubleshooting

- **Metro Bundler Issues**: If you encounter errors related to Metro bundler, try restarting the server with cache cleared:

  ```bash
  npx expo start -c
  ```

- **Dependency Issues**: Run `npm install` if you see missing dependencies.

### Useful Commands

- `npm start`: Start the development server.
- `npm install <package>`: Install a new package.
- `npx expo start -c`: Start the Expo server with cache cleared.

## Authors

- Frontend: Fatimah Mohammed, Malachi Clark
- Backend: Nathaniel Owusu, Syprian Oduor

## Contributions

### Frontend Implementations (Fatimah & Malachi in collaboration)

#### 1. Home Screen & Navigation
- Developed the **home screen** as the central hub for accessing core app features.
- Implemented navigation between key modules, including:
  - Map screen - view other users and their current listens in map
  - Grid screen - view other users and their current listens in grid list
  - Liked songs screen - view list of songs you have liked
  - Settings screen - place to toggle ghost mode, grid view, edit profile, sign out, and delete account
- Ensured smooth transitions and a cohesive user experience across all screens.

#### 2. Profile Creation & Customization
- Built the sign up interface for first time users
  - Upload profile pictures
  - Enter usernames
  - Enter password
- Enabled real-time updates for editable profile details, reflected in the app.

#### 3. Real-Time Music Updates
- Utilized the **Spotify API** to display:
  - Users' currently playing songs on their profiles.
  - List of user playlists to add a song to a selected one

### Backend Implementations (Nate & Syprian in collaboration)

#### 1. Database Setup & Data Management
- Configured **Google Firebase** instance as the primary  database 
- Developed functionality to store, update, and track user information, such as:
  - User ID
  - Profile information (profile picture, username, email, and encrypted password)
  - Liked songs
  - Current playing song
  - Real-time geo location
  - Playlist additions
  - Ghost mode

#### 2. Profile Management & Privacy
- Enabled users to modify profile settings and reflect to Firebase in real time
- Store all location data to be plotted on the map
- Implemented an **account deletion** feature with the following considerations:
  - Securely removed user data from the database.
  - Anonymized sensitive data where necessary to protect user privacy.
- Optimized backend services for scalability, security, and reliability
