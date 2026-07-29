import {
  formatSeedValidationReport,
  validateCanonicalSeedData,
} from "../prisma/seed-data-validation";

const report = validateCanonicalSeedData();
console.log(formatSeedValidationReport(report));

if (report.errors.length > 0) {
  process.exitCode = 1;
}
