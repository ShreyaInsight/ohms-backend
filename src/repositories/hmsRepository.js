const { pool } = require("../db/client");

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

async function getPatients({ status, query }) {
  let sql = `
    SELECT p.*, d.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON d.id = p.doctor_id
    WHERE 1 = 1
  `;
  const params = [];
  let i = 1;

  if (status) {
    sql += ` AND p.status = $${i++}`;
    params.push(status);
  }

  if (query) {
    sql += ` AND (p.patient_code ILIKE $${i} OR p.first_name ILIKE $${i + 1} OR p.last_name ILIKE $${i + 2} OR d.name ILIKE $${i + 3})`;
    const q = `%${query}%`;
    params.push(q, q, q, q);
    i += 4;
  }

  sql += " ORDER BY p.id DESC";
  const { rows } = await pool.query(sql, params);
  return rows.map(rowToPatientDto);
}

async function getPatientById(id) {
  const { rows } = await pool.query(
    `
    SELECT p.*, d.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON d.id = p.doctor_id
    WHERE p.id = $1
  `,
    [id]
  );
  return rows[0] ? rowToPatientDto(rows[0]) : null;
}

async function createPatient(payload) {
  const { rows } = await pool.query(
    `
    INSERT INTO patients (
      patient_code, first_name, last_name, age, gender, department, doctor_id, status,
      admitted_on, phone, blood_group, insurance_provider
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `,
    [
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
      payload.insuranceProvider || null,
    ]
  );
  return getPatientById(rows[0].id);
}

async function getDoctors() {
  const { rows } = await pool.query(`
    SELECT d.*, COUNT(p.id) AS active_patients
    FROM doctors d
    LEFT JOIN patients p ON p.doctor_id = d.id AND p.status IN ('admitted', 'critical', 'opd')
    GROUP BY d.id
    ORDER BY d.name ASC
  `);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    department: r.department,
    experienceYears: r.experience_years,
    status: r.status,
    avatar: r.avatar,
    activePatients: Number(r.active_patients),
  }));
}

async function getAppointments({ date }) {
  let sql = `
    SELECT a.*, p.first_name, p.last_name, p.patient_code, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    WHERE 1 = 1
  `;
  const params = [];

  if (date) {
    sql += " AND DATE(a.scheduled_at) = DATE($1)";
    params.push(date);
  }

  sql += " ORDER BY a.scheduled_at ASC";
  const { rows } = await pool.query(sql, params);

  return rows.map((r) => ({
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

async function createAppointment(payload) {
  const created = await pool.query(
    `
    INSERT INTO appointments (patient_id, doctor_id, department, appointment_type, scheduled_at, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `,
    [
      payload.patientId,
      payload.doctorId,
      payload.department,
      payload.appointmentType,
      payload.scheduledAt,
      payload.status || "scheduled",
      payload.notes || null,
    ]
  );

  const { rows } = await pool.query(
    `
    SELECT a.*, p.first_name, p.last_name, p.patient_code, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    WHERE a.id = $1
  `,
    [created.rows[0].id]
  );
  return rows[0];
}

async function getWardsWithBeds() {
  const wardsResult = await pool.query("SELECT * FROM wards ORDER BY id ASC");
  const wards = wardsResult.rows;
  const output = [];

  for (const ward of wards) {
    const bedsResult = await pool.query(
      "SELECT id, bed_number, status, patient_id FROM beds WHERE ward_id = $1 ORDER BY bed_number ASC",
      [ward.id]
    );
    const beds = bedsResult.rows;
    const occupied = beds.filter((b) => b.status === "occupied").length;
    const maintenance = beds.filter((b) => b.status === "maintenance").length;
    const free = beds.filter((b) => b.status === "free").length;
    output.push({
      id: ward.id,
      name: ward.name,
      totalBeds: ward.total_beds,
      occupied,
      maintenance,
      free,
      beds,
    });
  }
  return output;
}

async function getLabTests() {
  const { rows } = await pool.query(`
    SELECT l.*, p.first_name, p.last_name, d.name AS doctor_name
    FROM lab_tests l
    JOIN patients p ON p.id = l.patient_id
    JOIN doctors d ON d.id = l.ordered_by_doctor_id
    ORDER BY l.ordered_at DESC
  `);
  return rows.map((r) => ({
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

async function createLabTest(payload) {
  const { rows } = await pool.query(
    `
    INSERT INTO lab_tests (test_code, patient_id, ordered_by_doctor_id, test_name, priority, status, ordered_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [
      payload.testCode,
      payload.patientId,
      payload.orderedByDoctorId,
      payload.testName,
      payload.priority,
      payload.status || "pending",
      payload.orderedAt,
    ]
  );
  return rows[0];
}

async function getInvoices() {
  const { rows } = await pool.query(`
    SELECT i.*, p.first_name, p.last_name
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    ORDER BY i.issued_at DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    invoiceCode: r.invoice_code,
    patientId: r.patient_id,
    patientName: `${r.first_name} ${r.last_name}`,
    services: r.services,
    amount: Number(r.amount),
    insuranceAmount: Number(r.insurance_amount),
    netAmount: Number(r.net_amount),
    status: r.status,
    issuedAt: r.issued_at,
  }));
}

async function createInvoice(payload) {
  const { rows } = await pool.query(
    `
    INSERT INTO invoices (invoice_code, patient_id, services, amount, insurance_amount, net_amount, status, issued_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
    [
      payload.invoiceCode,
      payload.patientId,
      payload.services,
      payload.amount,
      payload.insuranceAmount || 0,
      payload.netAmount,
      payload.status || "pending",
      payload.issuedAt,
    ]
  );
  return rows[0];
}

async function getMedicines() {
  const { rows } = await pool.query("SELECT * FROM medicines ORDER BY name ASC");
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    stock: r.stock,
    unit: r.unit,
    expiryDate: r.expiry_date,
    status: r.status,
  }));
}

async function updateMedicineStock(id, stock) {
  const status = stock <= 5 ? "critical" : stock <= 20 ? "low" : "ok";
  const { rows } = await pool.query(
    `
    UPDATE medicines
    SET stock = $1, status = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `,
    [stock, status, id]
  );
  return rows[0] || null;
}

async function getDashboardSummary() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM patients)::int AS total_patients,
      (SELECT COUNT(*) FROM appointments WHERE DATE(scheduled_at) = CURRENT_DATE)::int AS todays_appointments,
      COALESCE((SELECT SUM(net_amount) FROM invoices WHERE DATE_TRUNC('month', issued_at) = DATE_TRUNC('month', NOW())), 0)::numeric AS monthly_revenue,
      (SELECT COUNT(*) FROM beds WHERE status = 'occupied')::int AS occupied_beds,
      (SELECT COUNT(*) FROM beds)::int AS total_beds
  `);
  const totals = rows[0];
  return {
    totalPatients: totals.total_patients || 0,
    todaysAppointments: totals.todays_appointments || 0,
    monthlyRevenue: Number(totals.monthly_revenue || 0),
    occupiedBeds: totals.occupied_beds || 0,
    totalBeds: totals.total_beds || 0,
  };
}

async function searchAcrossModules(query) {
  const q = `%${query}%`;
  const [patientsResult, doctorsResult, medicinesResult] = await Promise.all([
    pool.query(
      "SELECT id, patient_code, first_name, last_name FROM patients WHERE patient_code ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 LIMIT 10",
      [q]
    ),
    pool.query("SELECT id, name, department FROM doctors WHERE name ILIKE $1 OR department ILIKE $1 LIMIT 10", [q]),
    pool.query("SELECT id, name, category FROM medicines WHERE name ILIKE $1 OR category ILIKE $1 LIMIT 10", [q]),
  ]);

  return {
    patients: patientsResult.rows,
    doctors: doctorsResult.rows,
    medicines: medicinesResult.rows,
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
