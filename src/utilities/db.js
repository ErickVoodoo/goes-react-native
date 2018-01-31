/* 
* Db 
* @module Utilities 
* @flow  
*/

import squel from 'squel';

import { SETTINGS_KEYS, DEFAULT_SETTINGS } from '../constants/config';

const TABLENAMES = [
  {
    name: 'meta',
    fields: [{
      field: 'schedule',
      type: 'int(8)',
    }, {
      field: 'map',
      type: 'int(8)',
    }, {
      field: 'city',
      type: 'varchar(32)',
    }],
  },
  {
    name: 'stops',
    fields: [{
      field: 'id',
      type: 'int(8)',
    }, {
      field: 'p',
      type: 'varchar(128)',
    }, {
      field: 'lat',
      type: 'varchar(32)',
    }, {
      field: 'lng',
      type: 'varchar(32)',
    }, {
      field: 'a',
      type: 'int(8)',
    }, {
      field: 't',
      type: 'int(8)',
    }, {
      field: 'n',
      type: 'varchar(128)',
    }, {
      field: 'isfavorite',
      type: 'int(1)',
    }],
  },
  {
    name: 'times',
    fields: [{
      field: 'd_id', // direction_id
      type: 'int(8)',
    }, {
      field: 'r_id', // route_id
      type: 'int(8)',
    }, {
      field: 'id_s',
      type: 'int(8)',
    }, {
      field: 'pos',
      type: 'int(8)',
    }, {
      field: 'tms',
      type: 'varchar(256)',
    }],
  },
  {
    name: 'directions',
    fields: [{
      field: 'id',
      type: 'int(8)',
    }, {
      field: 'r_id', // route_id
      type: 'int(8)',
    }, {
      field: 'name',
      type: 'varchar(128)',
    }, {
      field: 'isfavorite',
      type: 'int(1)',
    }],
  },
  {
    name: 'routes',
    fields: [{
      field: 'id',
      type: 'int(8)',
    }, {
      field: 'name',
      type: 'varchar(128)',
    }, {
      field: 'type',
      type: 'int(8)',
    }, {
      field: 'active',
      type: 'int(8)',
    }],
  },
  {
    name: 'settings',
    fields: [{
      field: 'key',
      type: 'varchar(32)',
    }, {
      field: 'value',
      type: 'varchar(128)',
    }],
  },
  {
    name: 'schedule',
    fields: [{
      field: 'city',
      type: 'varchar(128)',
    }, {
      field: 's_id',
      type: 'int(8)',
    }, {
      field: 'd_id',
      type: 'int(8)',
    }, {
      field: 'direction',
      type: 'varchar(128)',
    }, {
      field: 'stop',
      type: 'varchar(128)',
    }, {
      field: 'transport',
      type: 'varchar(16)',
    }, {
      field: 'type',
      type: 'int(8)',
    }],
  },
  {
    name: 'iap',
    fields: [{
      field: 'productIdentifier',
      type: 'varchar(64)',
    }, {
      field: 'transactionDate',
      type: 'int(32)',
    }, {
      field: 'transactionIdentifier',
      type: 'varchar(128)',
    }, {
      field: 'transactionReceipt',
      type: 'varchar(128)',
    }],
  },
];

export class DBHelper {
  constructor(db) {
    this.db = db;
  }

  setSettings = () => new Promise((resolve) => {
    SETTINGS_KEYS.forEach((setting, index) => {
      this.select({
        table: 'settings',
        where: { key: setting },
      })
        .then((response) => {
          if (!response || !response.length) {
            this.insert({
              table: 'settings',
              values: {
                key: setting,
                value: DEFAULT_SETTINGS[setting],
              },
            });
          }

          if (index === SETTINGS_KEYS.length - 1) {
            return Promise.resolve();
          }
        })
        .then(() => {
          this.select({
            table: 'settings',
          })
            .then(() => {
              resolve();
            });
        });
    });
  })

  createDatabase = (): void => new Promise((resolve, reject) => {
    TABLENAMES.forEach(({ name, fields = [] }, index) => {
      let sql = `CREATE TABLE IF NOT EXISTS ${name} (`;

      fields.forEach(({ field, type }, i) => {
        sql = `${sql} ${field} ${type}${i === fields.length - 1 ? '' : ','}`
      });

      sql = `${sql});`;
      console.log(sql);
      this.db.transaction(tx =>
        tx.executeSql(sql, null, () => {
          if (TABLENAMES.length - 1 === index) {
            this.setSettings()
              .then(() => {
                resolve();
              });
          }
        }, reject),
      );
    });
  })

  query = ({ sql }): void => new Promise((resolve, reject) => {
    this.db.transaction((tx) => {
      tx.executeSql(sql, null, (_, results) => {
        const res = [];
        for (let i = 0; i < results.rows.length; i += 1) {
          res.push(results.rows.item(i));
        }

        resolve(res)
      }, reject)
    });
  })

  insert = ({ table = '', values = {} }: Object): void => new Promise((resolve, reject) => {
    this.db.transaction((tx) => {
      tx.executeSql(this.insertQuery({ table, values }), null, resolve, reject)
    });
  })
  
  insertQuery = ({ table, values }) => {
    const sql = squel
      .insert()
      .into(table);

    Object.keys(values).forEach((item) => {
      sql.set(item, values[item])
    });

    return sql.toString();
  }

  insertSync = ({ table = '', values = [] }) => new Promise((resolve) => {
    this.db.transaction((tx) => {
      values
        .forEach((value, index) => {
          tx.executeSql(this.insertQuery({ table, values: value }), null, () => {
            if (index === values.length - 1) {
              resolve();
            }
          })
        });
    });
  })

  updateQuery = ({ table, values, where }) => {
    const sql = squel
      .update()
      .table(table);

    Object.keys(values).forEach((item) => {
      sql.set(item, values[item])
    });
    Object.keys(where).forEach((item) => {
      sql.where(`${item} = ?`, where[item])
    });

    return sql.toString();
  }

  updateSync = ({ table = '', values = [], where }) => new Promise((resolve) => {
    this.db.transaction((tx) => {
      values
        .forEach((value, index) => {
          tx.executeSql(this.updateQuery({ table, values: value, where: where ? where(value) : {} }), null, () => {
            if (index === values.length - 1) {
              resolve();
            }
          })
        });
    });
  })

  select = ({ table = '', where = {} }): any => new Promise((resolve, reject) => {
    const sql = squel
      .select()
      .from(table);

    Object.keys(where).forEach((item) => {
      sql.where(`${item} = ?`, where[item])
    });

    this.db.transaction((tx) => {
      tx.executeSql(sql.toString(), null, (_, results) => {
        const res = [];
        for (let i = 0; i < results.rows.length; i += 1) {
          res.push(results.rows.item(i));
        }

        resolve(res);
      }, reject)
    });
  });

  deleteQuery = ({ table, where }) => {
    const sql = squel
      .delete()
      .from(table);

    Object.keys(where).forEach((item) => {
      sql.where(`${item} = ${where[item]}`);
    });

    return sql.toString();
  }

  delete = ({ table = '', where = {} }: Object): void => new Promise((resolve, reject) => {
    this.db.transaction((tx) => {
      tx.executeSql(this.deleteQuery({ table, where }), null, resolve, reject)
    });
  });

  update = ({ table = '', where = {}, values = {} }: Object): void => new Promise((resolve, reject) => {
    this.db.transaction((tx) => {
      tx.executeSql(this.updateQuery({ table, values, where }), null, resolve, reject)
    });
  });

  truncate =({ table }): Promise => new Promise((resolve, reject) => {
    const sql = squel
      .delete()
      .from(table);

    this.db.transaction((tx) => {
      tx.executeSql(sql.toString(), null, resolve, reject)
    });
  })

  drop =({ table }): Promise => new Promise((resolve, reject) => {
    const sql = `DROP TABLE ${table}`;

    this.db.transaction((tx) => {
      tx.executeSql(sql.toString(), null, resolve, reject)
    });
  });
}
