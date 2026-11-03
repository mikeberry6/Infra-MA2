CREATE TABLE "BriefingIssue" (
  "edition" TEXT NOT NULL PRIMARY KEY,
  "coverageStart" DATE NOT NULL,
  "coverageEnd" DATE NOT NULL,
  "archivePath" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "BriefingDeal" (
  "issueEdition" TEXT NOT NULL,
  "cardKey" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "dealId" TEXT NOT NULL,
  PRIMARY KEY ("issueEdition", "cardKey"),
  FOREIGN KEY ("issueEdition") REFERENCES "BriefingIssue"("edition") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "BriefingDeal_dealId_idx" ON "BriefingDeal"("dealId");
CREATE INDEX "BriefingDeal_issueEdition_position_idx" ON "BriefingDeal"("issueEdition", "position");
