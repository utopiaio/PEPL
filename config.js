/* eslint-disable */

module.exports = {
  // crypto
  HASH: 'sha512',
  SALT: 'canYouSmellWhatTheRockIsCooking',

  // database
  DB_HOST: '127.0.0.1',
  DB_USER: 'moe',
  DB_PASSWORD: '',
  DB_PORT: 5432,
  DB_NAME: 'pepl',
  DEFAULT_DEPTH: 1,
  REFERENCE_KEY: 'reference', // reference key (to be used for reverse referencing)

  // JWT
  JWT_HEADER: 'authorization',
  JWT_KEY: 'PEPL_!6_!7',
  JWT_ISS: 'PEPL',

  // EMAIL (nodemailer)
  email: {
    service: 'Gmail',
    auth: {
      user: 'moe.duffdude@gmail.com',
      pass: 'acwlumyyqrnmetpb', // has been revoked --- i think
    },
    from: 'MaMoe <moe.duffdude@gmail.com>',
    adminEmail: 'moe.duffdude@gmail.com',
  },

  // CORS
  CORS_WHITE_LIST: ['*', 'rock.io', 'foo.com'],
  CORS_METHODS: ['GET', 'POST', 'PATCH', 'DELETE'],
  CORS_HEADERS: ['Accept', 'Content-Type', 'Content-Range', 'Content-Disposition', 'Authorization'],
  CORS_MAX_AGE: '86400',

  // requests that require authentication + tailored permission
  AUTH_REQUESTS: {
    GET: [],
    POST: [],
    PATCH: [],
    DELETE: [],
  },

  // request that are NOT allowed
  FORBIDDEN_REQUESTS: {
    GET: [],
    POST: [],
    PATCH: [],
    DELETE: [],
  },

  TABLE_PREFIX: 'pepl_',
  TABLES: {
    user: {
      pk: 'user_id',
      columns: ['user_id', 'user_full_name', 'user_username', 'user_password', 'user_status', 'user_group'],
      returning: ['user_id', 'user_full_name', 'user_username', 'user_status', 'user_group'],
      int: ['user_id', 'user_group'],
      bool: ['user_status'],
      search: ['user_full_name', 'user_username'],
      fk: {
        user_group: { table: 'user_group', references: 'user_group_id' },
      },
    },
  },
};
