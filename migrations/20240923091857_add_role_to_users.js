exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.enu('role', ['user', 'admin']).defaultTo('user');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('role');
    });
  };
  