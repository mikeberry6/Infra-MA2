-- CreateTable
CREATE TABLE "NewsSourceDocument" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsSourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsSourceVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sections" JSONB NOT NULL,
    "metadata" JSONB,
    "amendsVersionId" TEXT,

    CONSTRAINT "NewsSourceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsDelivery" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "deliveryKey" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsStory" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "screeningKey" TEXT NOT NULL,
    "startSection" INTEGER NOT NULL,
    "endSection" INTEGER NOT NULL,
    "headline" TEXT,
    "screening" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsWork" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "storyId" TEXT,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "notBefore" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastError" TEXT,
    "finishedAt" TIMESTAMP(3),
    "result" JSONB,

    CONSTRAINT "NewsWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsProcessingAttempt" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "requestedModel" TEXT,
    "actualModel" TEXT,
    "providerRequestId" TEXT,
    "usage" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "result" JSONB,

    CONSTRAINT "NewsProcessingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTransactionThread" (
    "id" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "dealId" TEXT,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsTransactionThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsDevelopment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT,
    "kind" TEXT NOT NULL,
    "identityKey" TEXT,
    "approvedRevisionId" TEXT,
    "legacyNewsItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsDevelopment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsRevision" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "storyId" TEXT,
    "workId" TEXT,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "confidence" "NewsConfidence" NOT NULL,
    "isRumor" BOOLEAN NOT NULL DEFAULT false,
    "sourceVersionId" TEXT NOT NULL,
    "occurredOn" DATE,
    "firstDisclosedOn" DATE,
    "qualification" TEXT NOT NULL,
    "evidenceStatus" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,
    "dealEligibility" TEXT NOT NULL,
    "publicationEligibility" TEXT NOT NULL,
    "decisionDetails" JSONB,
    "proposal" JSONB,
    "correctsRevisionId" TEXT,
    "materialChange" BOOLEAN NOT NULL DEFAULT true,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsClaim" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "attribution" TEXT NOT NULL,
    "attributedTo" TEXT NOT NULL,

    CONSTRAINT "NewsClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsClaimEvidence" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "section" INTEGER NOT NULL,
    "quote" TEXT NOT NULL,

    CONSTRAINT "NewsClaimEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsEntityMatch" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "mention" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "candidateSnapshot" JSONB,
    "evidence" JSONB,
    "companyId" TEXT,
    "organizationId" TEXT,
    "fundId" TEXT,
    "dealId" TEXT,

    CONSTRAINT "NewsEntityMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsDealMutation" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "auditEventId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsDealMutation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsDigestEdition" (
    "date" TEXT NOT NULL,
    "cutoff" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsDigestEdition_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "NewsDigestEntry" (
    "editionDate" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "materialRevisionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "NewsDigestEntry_pkey" PRIMARY KEY ("editionDate","position")
);

-- CreateIndex
CREATE INDEX "NewsSourceDocument_canonicalUrl_idx" ON "NewsSourceDocument"("canonicalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSourceDocument_sourceKey_externalKey_key" ON "NewsSourceDocument"("sourceKey", "externalKey");

-- CreateIndex
CREATE INDEX "NewsSourceVersion_publishedAt_idx" ON "NewsSourceVersion"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSourceVersion_documentId_contentHash_key" ON "NewsSourceVersion"("documentId", "contentHash");

-- CreateIndex
CREATE INDEX "NewsDelivery_versionId_idx" ON "NewsDelivery"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDelivery_sourceKey_deliveryKey_key" ON "NewsDelivery"("sourceKey", "deliveryKey");

-- CreateIndex
CREATE UNIQUE INDEX "NewsStory_versionId_screeningKey_ordinal_key" ON "NewsStory"("versionId", "screeningKey", "ordinal");

-- CreateIndex
CREATE UNIQUE INDEX "NewsWork_key_key" ON "NewsWork"("key");

-- CreateIndex
CREATE INDEX "NewsWork_status_notBefore_idx" ON "NewsWork"("status", "notBefore");

-- CreateIndex
CREATE INDEX "NewsWork_status_leaseUntil_idx" ON "NewsWork"("status", "leaseUntil");

-- CreateIndex
CREATE INDEX "NewsWork_versionId_idx" ON "NewsWork"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsProcessingAttempt_workId_attempt_key" ON "NewsProcessingAttempt"("workId", "attempt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTransactionThread_identityKey_key" ON "NewsTransactionThread"("identityKey");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTransactionThread_dealId_key" ON "NewsTransactionThread"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDevelopment_identityKey_key" ON "NewsDevelopment"("identityKey");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDevelopment_approvedRevisionId_key" ON "NewsDevelopment"("approvedRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDevelopment_legacyNewsItemId_key" ON "NewsDevelopment"("legacyNewsItemId");

-- CreateIndex
CREATE INDEX "NewsDevelopment_threadId_kind_idx" ON "NewsDevelopment"("threadId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "NewsRevision_workId_key" ON "NewsRevision"("workId");

-- CreateIndex
CREATE INDEX "NewsRevision_status_createdAt_idx" ON "NewsRevision"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsRevision_status_reviewedAt_idx" ON "NewsRevision"("status", "reviewedAt");

-- CreateIndex
CREATE INDEX "NewsRevision_sourceVersionId_idx" ON "NewsRevision"("sourceVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsRevision_developmentId_number_key" ON "NewsRevision"("developmentId", "number");

-- CreateIndex
CREATE INDEX "NewsClaim_revisionId_idx" ON "NewsClaim"("revisionId");

-- CreateIndex
CREATE INDEX "NewsClaimEvidence_claimId_idx" ON "NewsClaimEvidence"("claimId");

-- CreateIndex
CREATE INDEX "NewsClaimEvidence_versionId_idx" ON "NewsClaimEvidence"("versionId");

-- CreateIndex
CREATE INDEX "NewsEntityMatch_revisionId_idx" ON "NewsEntityMatch"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDealMutation_auditEventId_key" ON "NewsDealMutation"("auditEventId");

-- CreateIndex
CREATE INDEX "NewsDealMutation_dealId_idx" ON "NewsDealMutation"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDigestEdition_cutoff_key" ON "NewsDigestEdition"("cutoff");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDigestEntry_revisionId_key" ON "NewsDigestEntry"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsDigestEntry_materialRevisionId_key" ON "NewsDigestEntry"("materialRevisionId");

-- AddForeignKey
ALTER TABLE "NewsSourceVersion" ADD CONSTRAINT "NewsSourceVersion_amendsVersionId_fkey" FOREIGN KEY ("amendsVersionId") REFERENCES "NewsSourceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsSourceVersion" ADD CONSTRAINT "NewsSourceVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "NewsSourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDelivery" ADD CONSTRAINT "NewsDelivery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "NewsSourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDelivery" ADD CONSTRAINT "NewsDelivery_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "NewsSourceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsStory" ADD CONSTRAINT "NewsStory_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "NewsSourceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsWork" ADD CONSTRAINT "NewsWork_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "NewsSourceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsWork" ADD CONSTRAINT "NewsWork_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "NewsStory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsProcessingAttempt" ADD CONSTRAINT "NewsProcessingAttempt_workId_fkey" FOREIGN KEY ("workId") REFERENCES "NewsWork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsTransactionThread" ADD CONSTRAINT "NewsTransactionThread_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDevelopment" ADD CONSTRAINT "NewsDevelopment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "NewsTransactionThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDevelopment" ADD CONSTRAINT "NewsDevelopment_approvedRevisionId_fkey" FOREIGN KEY ("approvedRevisionId") REFERENCES "NewsRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDevelopment" ADD CONSTRAINT "NewsDevelopment_legacyNewsItemId_fkey" FOREIGN KEY ("legacyNewsItemId") REFERENCES "NewsItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "NewsDevelopment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_sourceVersionId_fkey" FOREIGN KEY ("sourceVersionId") REFERENCES "NewsSourceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "NewsStory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_workId_fkey" FOREIGN KEY ("workId") REFERENCES "NewsWork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_correctsRevisionId_fkey" FOREIGN KEY ("correctsRevisionId") REFERENCES "NewsRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsClaim" ADD CONSTRAINT "NewsClaim_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "NewsRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsClaimEvidence" ADD CONSTRAINT "NewsClaimEvidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "NewsClaim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsClaimEvidence" ADD CONSTRAINT "NewsClaimEvidence_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "NewsSourceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsEntityMatch" ADD CONSTRAINT "NewsEntityMatch_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "NewsRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsEntityMatch" ADD CONSTRAINT "NewsEntityMatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsEntityMatch" ADD CONSTRAINT "NewsEntityMatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsEntityMatch" ADD CONSTRAINT "NewsEntityMatch_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsEntityMatch" ADD CONSTRAINT "NewsEntityMatch_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDealMutation" ADD CONSTRAINT "NewsDealMutation_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "NewsRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDealMutation" ADD CONSTRAINT "NewsDealMutation_auditEventId_fkey" FOREIGN KEY ("auditEventId") REFERENCES "AuditEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDigestEntry" ADD CONSTRAINT "NewsDigestEntry_editionDate_fkey" FOREIGN KEY ("editionDate") REFERENCES "NewsDigestEdition"("date") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsDigestEntry" ADD CONSTRAINT "NewsDigestEntry_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "NewsRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
