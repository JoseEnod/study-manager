const { grade, date } = require('../../lib/utils');
const db = require('../../configs/db');

module.exports = {
  all(callback) {
    db.query(`SELECT * 
    FROM students
    ORDER BY name
    `, (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows);
    });
  },
  teacherSelectOptions(callback) {
    db.query(`SELECT name, id FROM teachers`, (err, results) => {
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
    INSERT INTO students(
      name,
      avatar_url,
      email,
      birth,
      school_grade,
      hours,
      teacher_id
    ) VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `;

    const values = [
      req.body.name,
      req.body.avatar_url,
      req.body.email,
      date(req.body.birth).iso,
      req.body.school_grade,
      req.body.hours,
      req.body.teacher_id,
    ];

    db.query(query, values, (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows[0]);
    });

  },
  find(id, callback) {
    db.query(`
    SELECT students.*, teachers.name AS teacher_name
    FROM students
    LEFT JOIN teachers on (students.teacher_id = teachers.id)
    WHERE students.id = $1
    `, [id], (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows[0]);
    });
  },
  findBy(filter, callback) {
    db.query(`SELECT students.*
    FROM students
    WHERE students.name ILIKE '%${filter}%'
    OR students.subjects_taught ILIKE '%${filter}%'
    GROUP BY students.id
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
    UPDATE students set
      name=($1),
      avatar_url=($2),
      email=($3),
      birth=($4),
      school_grade=($5),
      hours=($6),
      teacher_id=($7)
    WHERE id = $8;
    `;

    const values = [
      req.body.name,
      req.body.avatar_url,
      req.body.email,
      date(req.body.birth).iso,
      req.body.school_grade,
      req.body.hours,
      req.body.teacher_id,
      req.body.id,
    ];

    db.query(query, values, (err, result) => {
      if (err) throw `DataBase error! ${err}`;

      callback();
    });
  },
  delete(id, callback) {
    db.query(`DELETE FROM students WHERE id = $1`, [id], (err, results) => {
      if (err) throw `DataBase error! ${err}`;
      callback();
    });

  },

  paginete(params) {
    const { filter, limit, offset, callback } = params;

    let query = '',
      filterQuery = '',
      totalQuerty = `(
        SELECT count(*) FROM students
      ) AS total`;

    if (filter) {
      filterQuery = `
      WHERE students.name ILIKE '%${filter}%'
      OR students.email ILIKE '%${filter}%'
      `;

      totalQuerty = `(
        SELECT count(*) FROM students
        ${filterQuery}
      ) AS total`;
    }

    query = `
    SELECT students.*, ${totalQuerty}
    FROM students
    ${filterQuery}
    GROUP BY students.id LIMIT $1 OFFSET $2
    `

    db.query(query, [limit, offset], (err, results) => {
      if (err) throw `DataBase error! ${err}`;

      callback(results.rows);
    });
  }
}