const express = require("express");
const service = require("../services/hmsService");
const authService = require("../services/authService");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth, requireAnyRole } = require("../middleware/auth");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

router.post("/auth/login", asyncHandler(async (req, res) => {
  const data = await authService.login(req.body || {});
  res.json({ success: true, data });
}));

router.get("/auth/me", requireAuth, asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user.id);
  res.json({ success: true, data });
}));

router.get("/dashboard/summary", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getDashboardSummary() });
}));

router.get("/search", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.search(String(req.query.q || "")) });
}));

router.get("/patients", asyncHandler(async (req, res) => {
  const data = await service.getPatients({
    status: req.query.status ? String(req.query.status) : undefined,
    query: req.query.q ? String(req.query.q) : undefined,
  });
  res.json({ success: true, data });
}));

router.post("/patients", requireAuth, requireAnyRole(["admin", "reception"]), asyncHandler(async (req, res) => {
  const data = await service.createPatient(req.body || {});
  res.status(201).json({ success: true, data });
}));

router.get("/doctors", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getDoctors() });
}));

router.get("/appointments", asyncHandler(async (req, res) => {
  const date = req.query.date ? String(req.query.date) : undefined;
  res.json({ success: true, data: await service.getAppointments({ date }) });
}));

router.post("/appointments", requireAuth, requireAnyRole(["admin", "reception", "doctor"]), asyncHandler(async (req, res) => {
  const data = await service.createAppointment(req.body || {});
  res.status(201).json({ success: true, data });
}));

router.get("/wards", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getWards() });
}));

router.get("/lab-tests", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getLabTests() });
}));

router.post("/lab-tests", requireAuth, requireAnyRole(["admin", "doctor", "lab"]), asyncHandler(async (req, res) => {
  const data = await service.createLabTest(req.body || {});
  res.status(201).json({ success: true, data });
}));

router.get("/invoices", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getInvoices() });
}));

router.post("/invoices", requireAuth, requireAnyRole(["admin", "reception"]), asyncHandler(async (req, res) => {
  const data = await service.createInvoice(req.body || {});
  res.status(201).json({ success: true, data });
}));

router.get("/medicines", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getMedicines() });
}));

router.post("/medicines/:id/reorder", requireAuth, requireAnyRole(["admin", "pharmacy"]), asyncHandler(async (req, res) => {
  const qtyToAdd = Number(req.body?.qtyToAdd || 100);
  const data = await service.reorderMedicine(Number(req.params.id), qtyToAdd);
  res.json({ success: true, data });
}));

module.exports = { apiRouter: router };
