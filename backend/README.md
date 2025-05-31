/backend
│
├── /src
│   ├── /config           # Configuration files (env, db config, etc)
│   ├── /controllers      # Route handlers (business logic)
│   ├── /middlewares      # Express middlewares (auth, error handling, logging)
│   ├── /models           # Database models / ORM schemas
│   ├── /routes           # Route definitions, grouped by resource (users, auth, properties)
│   ├── /services         # Business logic, external API calls, helper functions
│   ├── /utils            # Utility functions/helpers
│   ├── /jobs             # Background jobs (queues/workers)
│   ├── /events           # Event emitters/listeners (optional for decoupling)
│   ├── /docs             # API docs, swagger files (optional)
│   ├── app.js            # Express app setup (middleware, routes)
│   └── server.js         # Server bootstrap (app listen, startup scripts)
│
├── .env                  # Environment variables
├── package.json
├── README.md
└── .gitignore
