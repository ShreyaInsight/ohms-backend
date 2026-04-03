const repository = require("../repositories/hmsRepository");
const { HttpError, assertFound } = require("../utils/httpError");

function createPatientCode() {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `P-${suffix}`;
}

function createInvoiceCode() {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${suffix}`;
}

function createLabCode() {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `LAB-${suffix}`;
}

function validateRequired(payload, fields) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length) {
    throw new HttpError(400, `Missing required fields: ${missing.join(", ")}`);
  }
}

async function getPatients(filters) {
  return repository.getPatients(filters || {});
}

async function createPatient(payload) {
  validateRequired(payload, ["firstName", "lastName", "age", "gender", "department", "doctorId"]);

  return repository.createPatient({
    ...payload,
    patientCode: payload.patientCode || createPatientCode(),
    status: payload.status || "opd",
    admittedOn: payload.admittedOn || new Date().toISOString().slice(0, 10),
  });
}

async function getDoctors() {
  return repository.getDoctors();
}

async function getAppointments(filters) {
  return repository.getAppointments(filters || {});
}

async function createAppointment(payload) {
  validateRequired(payload, ["patientId", "doctorId", "department", "appointmentType", "scheduledAt"]);
  return repository.createAppointment(payload);
}

async function getWards() {
  return repository.getWardsWithBeds();
}

async function getLabTests() {
  return repository.getLabTests();
}

async function createLabTest(payload) {
  validateRequired(payload, ["patientId", "orderedByDoctorId", "testName", "priority", "orderedAt"]);
  return repository.createLabTest({
    ...payload,
    testCode: payload.testCode || createLabCode(),
  });
}

async function getInvoices() {
  return repository.getInvoices();
}

async function createInvoice(payload) {
  validateRequired(payload, ["patientId", "services", "amount", "netAmount", "issuedAt"]);
  return repository.createInvoice({
    ...payload,
    invoiceCode: payload.invoiceCode || createInvoiceCode(),
  });
}

async function getMedicines() {
  return repository.getMedicines();
}

async function reorderMedicine(id, qtyToAdd = 100) {
  const medicines = await repository.getMedicines();
  const existing = medicines.find((m) => Number(m.id) === Number(id));
  assertFound(existing, "Medicine not found");
  const nextStock = Number(existing.stock) + Number(qtyToAdd || 0);
  return repository.updateMedicineStock(id, nextStock);
}

async function getDashboardSummary() {
  return repository.getDashboardSummary();
}

async function search(query) {
  if (!query || query.length < 2) {
    throw new HttpError(400, "Search query must be at least 2 characters");
  }
  return repository.searchAcrossModules(query);
}

module.exports = {
  getPatients,
  createPatient,
  getDoctors,
  getAppointments,
  createAppointment,
  getWards,
  getLabTests,
  createLabTest,
  getInvoices,
  createInvoice,
  getMedicines,
  reorderMedicine,
  getDashboardSummary,
  search,
};
