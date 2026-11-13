-- Imported doctor CSV data may contain qualification names without the
-- institution or graduation year. Keep those source values nullable instead
-- of inventing metadata during the import.
ALTER TABLE "doctor_qualifications" ALTER COLUMN "institution" DROP NOT NULL;
ALTER TABLE "doctor_qualifications" ALTER COLUMN "year" DROP NOT NULL;
