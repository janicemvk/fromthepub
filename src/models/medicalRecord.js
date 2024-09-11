const db = require('../config/db');

class MedicalRecord {
  static async create(recordData) {
    const { patient_id, date, diagnosis, treatment } = recordData;
    const query = 'INSERT INTO medical_records(patient_id, date, diagnosis, treatment) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [patient_id, date, diagnosis, treatment];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const query = 'SELECT * FROM medical_records WHERE patient_id = $1';
    const { rows } = await db.query(query, [patientId]);
    return rows;
  }

  // Add more methods as needed
}

module.exports = MedicalRecord;