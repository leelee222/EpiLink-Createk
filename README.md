# EPILINK

EPILINK is a platform designed to enable students to share their business ideas and collaborate with others to bring those ideas to life. It functions as a social network focused on student entrepreneurship, allowing users to create profiles, post project ideas, interact through comments, and connect with each other to form teams.

## Table of Contents

- Features
- Getting Started
  - Prerequisites
  - Installation
  - Running the Application
- API Documentation
- Contributing
- License

## Features

- User authentication and profile management
- Posting and commenting on business ideas
- Following other users
- Sending and receiving messages
- Notifications for various activities
- Administrative functionalities

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/epilink.git
cd epilink
```

2. Set up the backend:

```sh
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Set up the frontend:

```sh
cd ../Frontend/createk
npm install
```

### Running the Application

#### Backend

1. Start the backend server:

```sh
cd Backend
fastapi run app/main.py --host 0.0.0.0 --port 8080 --reload
```

#### Frontend

1. Start the frontend development server:

```sh
cd Frontend/createk
npm start
```

#### Docker (Optional)

1. Build and run the Docker containers:

```sh
docker compose up --build
```

## API Documentation

The API documentation is available at `/docs` when the backend server is running. It provides detailed information about the available endpoints, request parameters, and responses.

## Contributing

We welcome contributions from the community! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the 

LICENSE

 file for details.

---

# Developer Guide

## Project Structure

```
Backend
├── app
│   ├── credentials
│   │   ├── client_secret.json
│   │   ├── config.py
│   ├── db
│   │   ├── base_repo.py
│   │   ├── connector.py
│   │   ├── __init__.py
│   │   ├── message_repo.py
│   │   ├── notif_repo.py
│   │   ├── post_repo.py
│   │   └── user_repo.py
│   ├── __init__.py
│   ├── main.py
│   ├── routers
│   │   ├── api
│   │   │   ├── api.py
│   │   ├── auth
│   │   │   ├── oauth2.py
│   │   ├── follow
│   │   │   ├── follow.py
│   │   ├── __init__.py
│   │   ├── limiter.py
│   │   ├── message
│   │   │   ├── message.py
│   │   ├── models.py
│   │   ├── post
│   │   │   ├── feed.py
│   │   │   ├── notif.py
│   │   │   ├── post.py
│   │   └── search
│   │       └── search.py
│   ├── template
│   │   ├── custom_swagger.html
│   │   └── welcome.html
│   └── utils
│       ├── auth_utils.py
│       ├── cache.py
│       ├── __init__.py
│       ├── mail.py
├── Dockerfile
└── requirements.txt
```

## Backend

The backend is built using FastAPI and MongoDB. Key components include:

- 

main.py

: Entry point for the FastAPI application.
- 

routers/

: Contains the API route definitions.
- 

db/

: Database interaction logic.
- 

utils/

: Utility functions and authentication logic.

### Key Files

- main.py: Initializes the FastAPI app and includes middleware and routers.
- api.py: Defines user-related API endpoints.
- user_repo.py: Handles user-related database operations.
- models.py: Defines Pydantic models for request and response validation.

### Running Tests

To run tests, use the following command:

```sh
pytest
```

## Frontend

The frontend is built using React and Create React App. Key components include:

- `src/`: Contains the React components and application logic.
- `public/`: Static assets and the HTML template.

### Key Files

- `package.json`: Defines the project dependencies and scripts.
- `src/index.js`: Entry point for the React application.
- `src/App.js`: Main application component.

### Running Tests

To run tests, use the following command:

```sh
npm test
```

## Environment Variables

Backend environment variables are stored in 

.env

. Key variables include:

- `DATABASE_URL`: MongoDB connection string.
- `SECRET_KEY`: Secret key for JWT authentication.

Frontend environment variables are stored in `Frontend/createk/.env`. Key variables include:

- `REACT_APP_API_URL`: URL of the backend API.

## Deployment

To deploy the application, you can use Docker or any cloud provider that supports Python and Node.js applications. Ensure you set the appropriate environment variables for your deployment environment.
