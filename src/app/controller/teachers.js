const { age, graduation, date } = require('../../lib/utils');
const Teacher = require('../models/teacher');

module.exports = {
  index(req, res) {
    let { filter, page, limit } = req.query;

    page = page || 1;
    limit = limit || 4;
    let offset = limit * (page - 1);

    const params = {
      filter,
      page,
      limit,
      offset,
      callback(data) {
        const teachers = data.map((teacher) => {
          return {
            ...teacher,
            subjects: teacher.subjects_taught.split(','),
          }
        });
        const pagination = {
          total: Math.ceil(teachers[0].total / limit),
          page
        }

        return res.render('teachers/index', { teachers, pagination, filter })
      },
    }

    Teacher.paginete(params);
  },
  create(req, res) {
    return res.render('teachers/create');
  },
  post(req, res) {
    Teacher.create(req, (teacher) => {
      return res.redirect(`/teachers/${teacher.id}`);
    });
  },
  show(req, res) {
    Teacher.find(req.params.id, (teacher) => {

      teacher.age = age(teacher.birth_date);
      teacher.schooling = graduation(teacher.education_level);

      teacher.subjects = teacher.subjects_taught.split(',');

      return res.render('teachers/show', { teacher });
    })

  },
  edit(req, res) {
    Teacher.find(req.params.id, (teacher) => {

      teacher.birth = date(teacher.birth_date).iso;
      teacher.subjects = teacher.subjects_taught;

      return res.render('teachers/edit', { teacher });
    });
  },
  put(req, res) {
    Teacher.update(req, () => {

      return res.redirect(`/teachers/${req.body.id}`)
    });

  },
  delete(req, res) {
    Teacher.delete(req.body.id, () => {
      return res.redirect('/');
    });
  }
}
