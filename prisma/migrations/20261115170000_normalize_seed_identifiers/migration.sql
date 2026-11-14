-- Normalize deterministic seed identifiers to UUIDs.
-- The previous seed used readable IDs such as org-seed-lab-..., but the
-- booking API correctly validates service and organization IDs as UUIDs.

UPDATE "organizations"
SET "id" = '00000000-0000-4000-8000-000000000000'
WHERE "id" = 'org-seed-cln-00000000-0000-0000-0000-000000000000';

UPDATE "organizations"
SET "id" = '00000000-0000-4000-8000-000000000001'
WHERE "id" = 'org-seed-lab-00000000-0000-0000-0000-000000000001';

UPDATE "organizations"
SET "id" = '00000000-0000-4000-8000-000000000002'
WHERE "id" = 'org-seed-rad-00000000-0000-0000-0000-000000000002';

UPDATE "diagnostic_services"
SET "id" = '00000000-0000-4000-8000-000000000004'
WHERE "id" = 'svc-seed-rad-xry-00000000-0000-0000-000000000004';

UPDATE "diagnostic_services"
SET "id" = '00000000-0000-4000-8000-000000000005'
WHERE "id" = 'svc-seed-rad-usg-00000000-0000-0000-000000000005';

UPDATE "diagnostic_services"
SET "id" = '00000000-0000-4000-8000-000000000006'
WHERE "id" = 'svc-seed-rad-mri-00000000-0000-0000-000000000006';
