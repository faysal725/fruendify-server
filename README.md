# Node-Express with MONGODB

A boilerplate for any enterprise rest api or service with Node.js, Express.

## Manual Installation

Clone the repo:

```bash
git clone https://github.com/nedbud/freundify_server.git
cd project_folder
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```


## Features

- **ORM**: [Mongoosejs](https://mongoosejs.com/)  orm for object data modeling
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Error handling**: centralized error handling
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) 
- **Testing**: unittests using [Mocha](https://mochajs.org/)
- **Caching**: Caching using [Redis](https://redis.io/)
- **Job scheduler**: with [Node-cron](https://www.npmjs.com/package/node-cron)
- **Dependency management**: with [Yarn / Npm](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Docker support**
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
#Server environment
NODE_ENV=development
#Port number
PORT=5000
MONGO_URI=mongodb://localhost:27017/freundify

#Db configuration
DB_HOST=127.0.0.1
DB_USER=user
DB_PASS="password"
DB_PORT=3306
DB_NAME=db_name


# JWT secret key
JWT_SECRET=1234
JWT_ADMIN_SECRET=5678
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=4320
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30

#Log config
LOG_FOLDER=logs/
LOG_FILE=%DATE%-app-log.log
LOG_LEVEL=error

#Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_USE_PASSWORD=no
REDIS_PASSWORD=your-password


```

## Project Structure

```
specs\
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--models\         # Sequelize models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--helper\         # Helper classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--cronJobs.js     # Job Scheduler
 |--index.js        # App entry point
```

## License

[MIT](LICENSE)
