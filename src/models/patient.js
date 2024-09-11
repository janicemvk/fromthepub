const db = require('../config/db');

class Patient {
  static async create(patientData) {
    const { name, dob, gender, contact } = patientData;
    const query = 'INSERT INTO patients(name, dob, gender, contact) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, dob, gender, contact];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM patients WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  // Add more methods as needed
}

module.exports = Patient;