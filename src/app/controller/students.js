const { date, grade } = require('../../lib/utils');
const Student = require('../models/student');

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
        const students = data.map((student) => {
          return {
            ...student,
            school_grade: grade(student.school_grade),
          };
        });

        const pagination = {
          total: Math.ceil(students[0].total / limit),
          page
        }
        return res.render('students/index', { students, pagination, filter })
      },
    }

    Student.paginete(params);
  },
  create(req, res) {
    Student.teacherSelectOptions((teacherOptions) => {
      return res.render('students/create', { teacherOptions });
    });

  },
  post(req, res) {
    Student.create(req, (student) => {
      return res.redirect(`/students/${student.id}`);
    });
  },
  show(req, res) {
    Student.find(req.params.id, (student) => {

      student.birth = date(student.birth).dayMonth;
      student.school_grade = grade(student.school_grade)

      return res.render('students/show', { student });
    })

  },
  edit(req, res) {
    Student.find(req.params.id, (student) => {

      student.birth = date(student.birth).iso;

      Student.teacherSelectOptions((teacherOptions) => {
        return res.render('students/edit', { student, teacherOptions });
      });


    });
  },
  put(req, res) {
    Student.update(req, () => {

      return res.redirect(`/students/${req.body.id}`)
    });

  },
  delete(req, res) {
    Student.delete(req.body.id, () => {
      return res.redirect('/');
    });
  }
}
