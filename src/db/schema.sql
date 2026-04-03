CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('on-duty','off','surgery')),
  avatar TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin','doctor','reception','lab','pharmacy')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('M','F','Other')),
  department TEXT NOT NULL,
  doctor_id INTEGER,
  status TEXT NOT NULL CHECK(status IN ('admitted','opd','critical','discharged')),
  admitted_on TEXT,
  phone TEXT,
  blood_group TEXT,
  insurance_provider TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  department TEXT NOT NULL,
  appointment_type TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('scheduled','in-progress','done','cancelled','waiting')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  total_beds INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ward_id INTEGER NOT NULL,
  bed_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('occupied','free','maintenance')),
  patient_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ward_id, bed_number),
  FOREIGN KEY(ward_id) REFERENCES wards(id) ON DELETE CASCADE,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lab_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_code TEXT NOT NULL UNIQUE,
  patient_id INTEGER NOT NULL,
  ordered_by_doctor_id INTEGER NOT NULL,
  test_name TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('routine','urgent','stat')),
  status TEXT NOT NULL CHECK(status IN ('pending','in-progress','ready')),
  ordered_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY(ordered_by_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_code TEXT NOT NULL UNIQUE,
  patient_id INTEGER NOT NULL,
  services TEXT NOT NULL,
  amount REAL NOT NULL,
  insurance_amount REAL NOT NULL DEFAULT 0,
  net_amount REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('paid','pending','partial','overdue')),
  issued_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL,
  unit TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ok','low','critical')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_department ON patients(department);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lab_status ON lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
