const { db } = require("../db/client");

const rowToPatientDto = (r) => ({
  id: r.id,
  patientCode: r.patient_code,
  firstName: r.first_name,
  lastName: r.last_name,
  fullName: `${r.first_name} ${r.last_name}`,
  age: r.age,
  gender: r.gender,
  department: r.department,
  doctorId: r.doctor_id,
  doctorName: r.doctor_name || null,
  status: r.status,
  admittedOn: r.admitted_on,
  phone: r.phone,
  bloodGroup: r.blood_group,
  insuranceProvider: r.insurance_provider,
});

function getPatients({ status, query }) {
  let sql = `
    SELECT p.*, d.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON d.id = p.doctor_id
    WHERE 1 = 1`;
  const params = [];

  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }

  if (query) {
    sql += " AND (p.patient_code LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR d.name LIKE ?)";
    const q = `%${query}%`;
    params.push(q, q, q, q);
  }

  sql += " ORDER BY p.id DESC";
  return db.prepare(sql).all(...params).map(rowToPatientDto);
}

function getPatientById(id) {
  const row = db.prepare(`
    SELECT p.*, d.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON d.id = p.doctor_id
    WHERE p.id = ?
  `).get(id);
  return row ? rowToPatientDto(row) : null;
}

function createPatient(payload) {
  const stmt = db.prepare(`
    INSERT INTO patients (
      patient_code, first_name, last_name, age, gender, department, doctor_id, status,
      admitted_on, phone, blood_group, insurance_provider
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.patientCode,
    payload.firstName,
    payload.lastName,
    payload.age,
    payload.gender,
    payload.department,
    payload.doctorId,
    payload.status,
    payload.admittedOn,
    payload.phone || null,
    payload.bloodGroup || null,
    payload.insuranceProvider || null
  );

  return getPatientById(result.lastInsertRowid);
}

function getDoctors() {
  const sql = `
    SELECT d.*, COUNT(p.id) AS active_patients
    FROM doctors d
    LEFT JOIN patients p ON p.doctor_id = d.id AND p.status IN ('admitted', 'critical', 'opd')
    GROUP BY d.id
    ORDER BY d.name ASC
  `;
  return db.prepare(sql).all().map((r) => ({
    id: r.id,
    name: r.name,
    department: r.department,
    experienceYears: r.experience_years,
    status: r.status,
    avatar: r.avatar,
    activePatients: r.active_patients,
  }));
}

function getAppointments({ date }) {
  let sql = `
    SELECT a.*, p.first_name, p.last_name, p.patient_code, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    WHERE 1 = 1
  `;
  const params = [];

  if (date) {
    sql += " AND date(a.scheduled_at) = date(?)";
    params.push(date);
  }

  sql += " ORDER BY datetime(a.scheduled_at) ASC";

  return db.prepare(sql).all(...params).map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    patientName: `${r.first_name} ${r.last_name}`,
    patientCode: r.patient_code,
    doctorId: r.doctor_id,
    doctorName: r.doctor_name,
    department: r.department,
    appointmentType: r.appointment_type,
    scheduledAt: r.scheduled_at,
    status: r.status,
    notes: r.notes,
  }));
}

function createAppointment(payload) {
  const stmt = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, department, appointment_type, scheduled_at, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.patientId,
    payload.doctorId,
    payload.department,
    payload.appointmentType,
    payload.scheduledAt,
    payload.status || "scheduled",
    payload.notes || null
  );

  return db.prepare(`
    SELECT a.*, p.first_name, p.last_name, p.patient_code, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);
}

function getWardsWithBeds() {
  const wards = db.prepare("SELECT * FROM wards ORDER BY id ASC").all();
  return wards.map((ward) => {
    const beds = db
      .prepare("SELECT id, bed_number, status, patient_id FROM beds WHERE ward_id = ? ORDER BY bed_number ASC")
      .all(ward.id);
    const occupied = beds.filter((b) => b.status === "occupied").length;
    const maintenance = beds.filter((b) => b.status === "maintenance").length;
    const free = beds.filter((b) => b.status === "free").length;
    return {
      id: ward.id,
      name: ward.name,
      totalBeds: ward.total_beds,
      occupied,
      maintenance,
      free,
      beds,
    };
  });
}

function getLabTests() {
  return db
    .prepare(`
    SELECT l.*, p.first_name, p.last_name, d.name AS doctor_name
    FROM lab_tests l
    JOIN patients p ON p.id = l.patient_id
    JOIN doctors d ON d.id = l.ordered_by_doctor_id
    ORDER BY datetime(l.ordered_at) DESC
  `)
    .all()
    .map((r) => ({
      id: r.id,
      testCode: r.test_code,
      patientId: r.patient_id,
      patientName: `${r.first_name} ${r.last_name}`,
      orderedByDoctorId: r.ordered_by_doctor_id,
      orderedByDoctorName: r.doctor_name,
      testName: r.test_name,
      priority: r.priority,
      status: r.status,
      orderedAt: r.ordered_at,
    }));
}

function createLabTest(payload) {
  const stmt = db.prepare(`
    INSERT INTO lab_tests (test_code, patient_id, ordered_by_doctor_id, test_name, priority, status, ordered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.testCode,
    payload.patientId,
    payload.orderedByDoctorId,
    payload.testName,
    payload.priority,
    payload.status || "pending",
    payload.orderedAt
  );

  return db.prepare("SELECT * FROM lab_tests WHERE id = ?").get(result.lastInsertRowid);
}

function getInvoices() {
  return db
    .prepare(`
    SELECT i.*, p.first_name, p.last_name
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    ORDER BY datetime(i.issued_at) DESC
  `)
    .all()
    .map((r) => ({
      id: r.id,
      invoiceCode: r.invoice_code,
      patientId: r.patient_id,
      patientName: `${r.first_name} ${r.last_name}`,
      services: r.services,
      amount: r.amount,
      insuranceAmount: r.insurance_amount,
      netAmount: r.net_amount,
      status: r.status,
      issuedAt: r.issued_at,
    }));
}

function createInvoice(payload) {
  const stmt = db.prepare(`
    INSERT INTO invoices (invoice_code, patient_id, services, amount, insurance_amount, net_amount, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.invoiceCode,
    payload.patientId,
    payload.services,
    payload.amount,
    payload.insuranceAmount || 0,
    payload.netAmount,
    payload.status || "pending",
    payload.issuedAt
  );

  return db.prepare("SELECT * FROM invoices WHERE id = ?").get(result.lastInsertRowid);
}

function getMedicines() {
  return db.prepare("SELECT * FROM medicines ORDER BY name ASC").all().map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    stock: r.stock,
    unit: r.unit,
    expiryDate: r.expiry_date,
    status: r.status,
  }));
}

function updateMedicineStock(id, stock) {
  const status = stock <= 5 ? "critical" : stock <= 20 ? "low" : "ok";
  const stmt = db.prepare("UPDATE medicines SET stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(stock, status, id);
  return db.prepare("SELECT * FROM medicines WHERE id = ?").get(id);
}

function getDashboardSummary() {
  const totals = db
    .prepare(`
    SELECT
      (SELECT COUNT(*) FROM patients) AS total_patients,
      (SELECT COUNT(*) FROM appointments WHERE date(scheduled_at) = date('now')) AS todays_appointments,
      (SELECT SUM(net_amount) FROM invoices WHERE strftime('%Y-%m', issued_at) = strftime('%Y-%m', 'now')) AS monthly_revenue,
      (SELECT COUNT(*) FROM beds WHERE status = 'occupied') AS occupied_beds,
      (SELECT COUNT(*) FROM beds) AS total_beds
  `)
    .get();

  return {
    totalPatients: totals.total_patients || 0,
    todaysAppointments: totals.todays_appointments || 0,
    monthlyRevenue: Number(totals.monthly_revenue || 0),
    occupiedBeds: totals.occupied_beds || 0,
    totalBeds: totals.total_beds || 0,
  };
}

function searchAcrossModules(query) {
  const q = `%${query}%`;
  const patients = db
    .prepare("SELECT id, patient_code, first_name, last_name FROM patients WHERE patient_code LIKE ? OR first_name LIKE ? OR last_name LIKE ? LIMIT 10")
    .all(q, q, q);
  const doctors = db.prepare("SELECT id, name, department FROM doctors WHERE name LIKE ? OR department LIKE ? LIMIT 10").all(q, q);
  const medicines = db.prepare("SELECT id, name, category FROM medicines WHERE name LIKE ? OR category LIKE ? LIMIT 10").all(q, q);

  return {
    patients,
    doctors,
    medicines,
  };
}

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  getDoctors,
  getAppointments,
  createAppointment,
  getWardsWithBeds,
  getLabTests,
  createLabTest,
  getInvoices,
  createInvoice,
  getMedicines,
  updateMedicineStock,
  getDashboardSummary,
  searchAcrossModules,
};
