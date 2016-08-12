const pg = require('pg');

/**
 * PG Mapper
 *
 * @param  {Object} config
 * @param  {Object} config.config
 * @param  {Resource} config.pgClient
 */
module.exports = (config) => {
  let pgClient = null;

  return {
    /**
     * creates a new PG Client (returns previous one if already created)
     *
     * @return {Object}
     */
    pgClient() {
      if (pgClient === null) {
        pgClient = new pg.Client(process.env.DATABASE_URL || `tcp://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
        pgClient.connect();
        return pgClient;
      }

      return pgClient;
    },

    /**
     * builds return table syntax
     * field types like Geometry need special treatment
     *
     * @param  {String} table
     * @return {String}
     */
    buildReturn(table) {
      let build = '';

      config.TABLES[table].returning.forEach((column) => {
        if (
          config.TABLES[table].hasOwnProperty('geometry') &&
          config.TABLES[table].geometry.includes(column)
        ) {
          build += `ST_AsGeoJSON(${column}) as ${column}, `;
        } else {
          build += `${column}, `;
        }
      });

      return build.substring(0, build.length - 2);
    },

    /**
     * given table and data; casts appropriately for pg operation
     *
     * @param  {String} table
     * @param  {Object} data
     * @return {Object}
     */
    castForPg(table, data) {
      const copy = Object.assign({}, data);

      Object.keys(copy).forEach((column) => {
        if (
          config.TABLES[table].hasOwnProperty('JSON') &&
          config.TABLES[table].JSON.includes(column)
        ) {
          copy[column] = JSON.stringify(copy[column]);
        } else if (
          config.TABLES[table].hasOwnProperty('bool') &&
          config.TABLES[table].bool.includes(column)
        ) {
          copy[column] = copy[column] === true ? 'TRUE' : 'FALSE';
        } else if (
          config.TABLES[table].hasOwnProperty('geometry') &&
          config.TABLES[table].geometry.includes(column)
        ) {
          copy[column] = JSON.stringify(copy[column]);
        } else if (
          (
            config.TABLES[table].hasOwnProperty('[int]') &&
            config.TABLES[table]['[int]'].includes(column)
          ) ||
          (
            config.TABLES[table].hasOwnProperty('[float]') &&
            config.TABLES[table]['[float]'].includes(column)
          ) ||
          (
            config.TABLES[table].hasOwnProperty('[double]') &&
            config.TABLES[table]['[double]'].includes(column)
          )
        ) {
          copy[column] = `{${copy[column].join(', ')}}`;
        }
      });

      return copy;
    },
  };
};
