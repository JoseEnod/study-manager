const { grade, date } = require('../../lib/utils');
const db = require('../../configs/db');

module.exports = {
  all(callback) {
    db.query(`SELECT teachers.*, count(students) AS total_students
    FROM teachers
    LEFT JOIN students ON (teachers.id = students.teacher_id)
    GROUP BY teachers.id
    ORDER BY total_students DESC
    `, (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows);
    });
  },
  create(req, callback) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] === '')
        return res.send('Fill all camps.');
    }

    const query = `
    INSERT INTO teachers(
      name,
      avatar_url,
      birth_date,
      education_level,
      class_type,
      subjects_taught,
      created_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `;

    const values = [
      req.body.name,
      req.body.avatar_url,
      date(req.body.birth).iso,
      req.body.education_level,
      req.body.class_type,
      req.body.subjects,
      date(Date.now()).iso,
    ];

    db.query(query, values, (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows[0]);
    });

  },
  find(id, callback) {
    db.query(`SELECT * FROM teachers WHERE id = $1`, [id], (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows[0]);
    });
  },
  findBy(filter, callback) {
    db.query(`SELECT teachers.*, count(students) AS total_students
    FROM teachers
    LEFT JOIN students ON (teachers.id = students.teacher_id)
    WHERE teachers.name ILIKE '%${filter}%'
    OR teachers.subjects_taught ILIKE '%${filter}%'
    GROUP BY teachers.id
    ORDER BY total_students DESC
    `, (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows);
    });
  },
  update(req, callback) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] === '')
        return res.send('Fill all camps.');
    }

    const query = `
    UPDATE teachers set
      name=($1),
      avatar_url=($2),
      birth_date=($3),
      education_level=($4),
      class_type=($5),
      subjects_taught=($6)
    WHERE id = $7 
    `;

    const values = [
      req.body.name,
      req.body.avatar_url,
      date(req.body.birth).iso,
      req.body.education_level,
      req.body.class_type,
      req.body.subjects,
      req.body.id,
    ];

    db.query(query, values, (err, result) => {
      if (err) throw `DataBase error! ${err}`;

      callback();
    });
  },
  delete(id, callback) {
    db.query(`DELETE FROM teachers WHERE id = $1`, [id], (err, results) => {
      if (err) throw `DataBase error! ${err}`;
      callback();
    });

  },
  paginete(params) {
    const { filter, limit, offset, callback } = params;

    let query = '',
      filterQuery = '',
      totalQuerty = `(
        SELECT count(*) FROM teachers
      ) AS total`;

    if (filter) {
      filterQuery = `
      WHERE teachers.name ILIKE '%${filter}%'
      OR teachers.subjects_taught ILIKE '%${filter}%'
      `;

      totalQuerty = `(
        SELECT count(*) FROM teachers
        ${filterQuery}
      ) AS total`;
    }

    query = `
    SELECT teachers.*, ${totalQuerty}, count(students) as total_students
    FROM teachers
    LEFT JOIN students ON (teachers.id = students.teacher_id)
    ${filterQuery}
    GROUP BY teachers.id LIMIT $1 OFFSET $2
    `

    db.query(query, [limit, offset], (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows);
    });
  }
}