DELETE FROM beds;
DELETE FROM wards;
DELETE FROM appointments;
DELETE FROM lab_tests;
DELETE FROM invoices;
DELETE FROM medicines;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM users;

INSERT INTO doctors (id, name, department, experience_years, status, avatar) VALUES
(1, 'Dr. Rajan Sharma', 'General Medicine', 18, 'on-duty', 'RS'),
(2, 'Dr. Anita Kapoor', 'Cardiology', 14, 'on-duty', 'AK'),
(3, 'Dr. Suresh Nair', 'Orthopedics', 11, 'off', 'SN'),
(4, 'Dr. Pooja Reddy', 'Neurology', 9, 'on-duty', 'PR'),
(5, 'Dr. Alok Patel', 'Dermatology', 7, 'on-duty', 'AP'),
(6, 'Dr. Nisha Joshi', 'Maternity', 12, 'on-duty', 'NJ'),
(7, 'Dr. Kiran Mehta', 'Surgery', 16, 'surgery', 'KM'),
(8, 'Dr. Raj Iyer', 'Pediatrics', 10, 'on-duty', 'RI');

INSERT INTO patients (id, patient_code, first_name, last_name, age, gender, department, doctor_id, status, admitted_on, phone, blood_group, insurance_provider) VALUES
(1, 'P-0001', 'Priya', 'Mehta', 34, 'F', 'Cardiology', 2, 'admitted', '2026-04-01', '9876543210', 'A+', 'Star Health'),
(2, 'P-0002', 'Arjun', 'Verma', 52, 'M', 'Orthopedics', 3, 'opd', '2026-04-03', '9876543211', 'B+', 'PMJAY'),
(3, 'P-0003', 'Sunita', 'Rao', 45, 'F', 'General Medicine', 1, 'admitted', '2026-03-28', '9876543212', 'O+', 'HDFC Ergo'),
(4, 'P-0004', 'Vikram', 'Singh', 61, 'M', 'Neurology', 4, 'admitted', '2026-03-30', '9876543213', 'AB+', 'Niva Bupa'),
(5, 'P-0005', 'Ananya', 'Das', 28, 'F', 'Maternity', 6, 'admitted', '2026-04-02', '9876543214', 'A-', 'Care Health'),
(6, 'P-0006', 'Ramesh', 'Gupta', 70, 'M', 'ICU', 1, 'critical', '2026-04-03', '9876543215', 'O-', 'Star Health'),
(7, 'P-0007', 'Kavita', 'Nair', 39, 'F', 'Dermatology', 5, 'opd', '2026-04-03', '9876543216', 'B-', 'ICICI Lombard'),
(8, 'P-0008', 'Deepak', 'Joshi', 55, 'M', 'General Medicine', 1, 'discharged', '2026-03-25', '9876543217', 'A+', 'None'),
(9, 'P-0009', 'Meera', 'Agarwal', 42, 'F', 'Surgery', 7, 'admitted', '2026-04-01', '9876543218', 'AB-', 'Bajaj Allianz'),
(10, 'P-0010', 'Suresh', 'Yadav', 67, 'M', 'Cardiology', 2, 'admitted', '2026-03-29', '9876543219', 'O+', 'PMJAY');

INSERT INTO appointments (patient_id, doctor_id, department, appointment_type, scheduled_at, status, notes) VALUES
(1, 1, 'General Medicine', 'Consultation', '2026-04-03T09:00:00', 'done', 'Routine checkup'),
(2, 2, 'Cardiology', 'Consultation', '2026-04-03T10:30:00', 'in-progress', 'Chest pain follow-up'),
(3, 3, 'Orthopedics', 'Follow-up', '2026-04-03T11:15:00', 'waiting', 'Knee pain review'),
(4, 4, 'Neurology', 'Consultation', '2026-04-03T12:00:00', 'scheduled', 'Migraine assessment'),
(5, 5, 'Dermatology', 'Consultation', '2026-04-03T14:00:00', 'scheduled', 'Rash evaluation');

INSERT INTO wards (id, name, total_beds) VALUES
(1, 'ICU', 20),
(2, 'General Ward', 24),
(3, 'Maternity', 16),
(4, 'Pediatrics', 24);

INSERT INTO beds (ward_id, bed_number, status) VALUES
(1, 1, 'occupied'),(1, 2, 'occupied'),(1, 3, 'occupied'),(1, 4, 'occupied'),(1, 5, 'occupied'),(1, 6, 'occupied'),(1, 7, 'occupied'),(1, 8, 'occupied'),(1, 9, 'occupied'),(1, 10, 'occupied'),(1, 11, 'occupied'),(1, 12, 'occupied'),(1, 13, 'occupied'),(1, 14, 'occupied'),(1, 15, 'occupied'),(1, 16, 'occupied'),(1, 17, 'occupied'),(1, 18, 'occupied'),(1, 19, 'maintenance'),(1, 20, 'free'),
(2, 1, 'occupied'),(2, 2, 'occupied'),(2, 3, 'occupied'),(2, 4, 'occupied'),(2, 5, 'occupied'),(2, 6, 'occupied'),(2, 7, 'occupied'),(2, 8, 'occupied'),(2, 9, 'occupied'),(2, 10, 'occupied'),(2, 11, 'occupied'),(2, 12, 'occupied'),(2, 13, 'occupied'),(2, 14, 'occupied'),(2, 15, 'occupied'),(2, 16, 'occupied'),(2, 17, 'occupied'),(2, 18, 'occupied'),(2, 19, 'occupied'),(2, 20, 'occupied'),(2, 21, 'maintenance'),(2, 22, 'maintenance'),(2, 23, 'free'),(2, 24, 'free'),
(3, 1, 'occupied'),(3, 2, 'occupied'),(3, 3, 'occupied'),(3, 4, 'occupied'),(3, 5, 'occupied'),(3, 6, 'occupied'),(3, 7, 'occupied'),(3, 8, 'occupied'),(3, 9, 'occupied'),(3, 10, 'occupied'),(3, 11, 'occupied'),(3, 12, 'occupied'),(3, 13, 'maintenance'),(3, 14, 'free'),(3, 15, 'free'),(3, 16, 'free'),
(4, 1, 'occupied'),(4, 2, 'occupied'),(4, 3, 'occupied'),(4, 4, 'occupied'),(4, 5, 'occupied'),(4, 6, 'occupied'),(4, 7, 'occupied'),(4, 8, 'occupied'),(4, 9, 'occupied'),(4, 10, 'occupied'),(4, 11, 'occupied'),(4, 12, 'occupied'),(4, 13, 'occupied'),(4, 14, 'occupied'),(4, 15, 'occupied'),(4, 16, 'maintenance'),(4, 17, 'maintenance'),(4, 18, 'free'),(4, 19, 'free'),(4, 20, 'free'),(4, 21, 'free'),(4, 22, 'free'),(4, 23, 'free'),(4, 24, 'free');

INSERT INTO lab_tests (test_code, patient_id, ordered_by_doctor_id, test_name, priority, status, ordered_at) VALUES
('LAB-4821', 2, 1, 'Complete Blood Count', 'routine', 'pending', '2026-04-03T09:15:00'),
('LAB-4822', 6, 2, 'ABG Analysis', 'urgent', 'in-progress', '2026-04-03T09:30:00'),
('LAB-4823', 3, 3, 'Lipid Profile', 'routine', 'pending', '2026-04-03T10:00:00'),
('LAB-4824', 4, 4, 'MRI Brain Report', 'urgent', 'ready', '2026-04-03T08:00:00'),
('LAB-4825', 5, 6, 'Blood Glucose', 'routine', 'ready', '2026-04-03T07:45:00'),
('LAB-4826', 9, 7, 'Urine Culture', 'stat', 'in-progress', '2026-04-03T10:30:00');

INSERT INTO invoices (invoice_code, patient_id, services, amount, insurance_amount, net_amount, status, issued_at) VALUES
('INV-2841', 2, 'Consultation, ECG', 3200, 1500, 1700, 'paid', '2026-04-03T09:00:00'),
('INV-2842', 6, 'ICU (2 days), Surgery', 82000, 60000, 22000, 'pending', '2026-04-03T09:30:00'),
('INV-2843', 3, 'Ward (3 days), X-Ray', 15400, 10000, 5400, 'partial', '2026-04-03T10:00:00'),
('INV-2844', 8, 'Consultation, Labs', 4800, 0, 4800, 'paid', '2026-04-03T08:45:00'),
('INV-2845', 5, 'Maternity package', 45000, 35000, 10000, 'pending', '2026-04-03T10:30:00'),
('INV-2846', 9, 'Surgery, Anesthesia', 110000, 80000, 30000, 'overdue', '2026-04-03T11:15:00');

INSERT INTO medicines (name, category, stock, unit, expiry_date, status) VALUES
('Amoxicillin 500mg', 'Antibiotic', 12, 'Strips', '2026-06-30', 'low'),
('Metformin 850mg', 'Antidiabetic', 8, 'Strips', '2026-09-30', 'low'),
('Aspirin 75mg', 'Antiplatelet', 15, 'Strips', '2026-12-31', 'low'),
('Paracetamol 500mg', 'Analgesic', 240, 'Strips', '2027-03-31', 'ok'),
('Pantoprazole 40mg', 'Antacid', 180, 'Strips', '2027-07-31', 'ok'),
('Amlodipine 5mg', 'Antihypertensive', 90, 'Strips', '2026-11-30', 'ok'),
('Insulin Glargine', 'Insulin', 22, 'Vials', '2026-08-31', 'ok'),
('Dexamethasone 4mg', 'Steroid', 5, 'Vials', '2026-05-31', 'critical');
