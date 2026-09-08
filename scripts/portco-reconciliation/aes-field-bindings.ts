/** Immutable task154 existing-source audit inputs; no write authority. */
export const AES={
  "companyId": "cmrxpjgmk00yxivhegkkxve01",
  "proposalSha256": "8a442316a28ed122c37919a8acb6aee1df60a79cc696a71e4ad7cd21f079c2ad",
  "approvalSha256": "6d68b1100fd15d1d74b9f84b506eabe6ed52afed8be1f0732ab0308843f6ebab",
  "receiptSha256": "f4088c2b0cec54964c35c00ce30b1b1b7bb1bdbfeb14ce641716b5802b6d6aa3",
  "batchSha256": "7de097a43b4e7d5cafbf7bdf16fa057a749227ab0568c09279449847dc8f42e3",
  "batchReceiptSha256": "00adb897adad21aa4fc3afc2d82749096d31e651ae05e8ebb3d771da2c35076e",
  "seedSpecSha256": "e896cae274fcfabb8926ee2a748e6849dd60dcd955e069426e9cfdf18e115aed",
  "seedBatchSha256": "7de097a43b4e7d5cafbf7bdf16fa057a749227ab0568c09279449847dc8f42e3"
} as const;
export const AES_SOURCE_ROOT="audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes" as const;
export const AES_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0154-the-aes-corporation" as const;
export const AES_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0152-0156-v1" as const;
export const AES_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "205c34932b9f25969bc1b84b8b5e11cc620d8a9458c63d8dc905e8ab719dab5a"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "9abad8d835274ace7d8723c026bdd94bc182db7ba0bb38f1d3de7ffbc08583cf"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "9abad8d835274ace7d8723c026bdd94bc182db7ba0bb38f1d3de7ffbc08583cf"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "4f63b5c365b19767c4f4cc8dbf7e1c1cbc161ca7c1d96b6777dc9fd865a63208"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "acc2920893f5c83d4fa731ecf2bdc745a7b8fda4d29534630b53ae4ed5a107c3"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "fa9ec0715bb5a389c508a5c4cc23fe7cbfe92bf2381d60df612605d09aa4525b"
  ],
  [
    "attempt-1/source-verification.json",
    "81d4d594256fa855cc61ebaaf5ba4d3d047f14e6cbb934f00b02f52c22238b6a"
  ],
  [
    "attempt-1/research-decision.json",
    "b7263172d8ecd2ebaf67e3247d917d4a6a8e0e02471a4af22df115b239640109"
  ],
  [
    "attempt-1/research-decision.md",
    "6394e541b9924abfc01e63fdcb1542bf58f5295a1002ac78871b563aa357b2d6"
  ]
] as const;
const AES_CAPTURE_SOURCES=[
  {
    "id": "agreement",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/agreement.html",
    "url": "https://www.sec.gov/Archives/edgar/data/874761/000119312526084157/d100078dex21.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/874761/000119312526084157/d100078dex21.htm",
    "bytes": 4817,
    "sha256": "0941b9aeb669820906e6d8e315383907d0f22dd9ca5a84304f454925b8682855",
    "httpStatus": 403,
    "historical": true,
    "reused": false
  },
  {
    "id": "vote",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/vote.html",
    "url": "https://www.sec.gov/Archives/edgar/data/874761/000114036126026562/ef20076870_8k.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/874761/000114036126026562/ef20076870_8k.htm",
    "bytes": 4817,
    "sha256": "58aa9fb1d6410a1b7bd345ebc8602efa12c4056c0ffff1c0a7f358e228057c42",
    "httpStatus": 403,
    "historical": true,
    "reused": false
  },
  {
    "id": "q2-note",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/q2-note.html",
    "url": "https://www.sec.gov/Archives/edgar/data/874761/000087476126000144/R31.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/874761/000087476126000144/R31.htm",
    "bytes": 4817,
    "sha256": "60f15f3c0d855efd2656ae015fd9ecfcac48b17acfcf3aa33dcee67a5928decb",
    "httpStatus": 403,
    "historical": true,
    "reused": false
  },
  {
    "id": "ny-review",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/ny-review.html",
    "url": "https://dps.ny.gov/event/comments-period-begins-horizon-merger-sub-inc-and-aes-corporation-petition-seeking",
    "finalUrl": "https://dps.ny.gov/event/comments-period-begins-horizon-merger-sub-inc-and-aes-corporation-petition-seeking",
    "bytes": 31568,
    "sha256": "29fbf830ce428794f52bc6cb061d4882938a8b6adaa8dc2f0a8e9e8d89035100",
    "httpStatus": 200,
    "historical": true,
    "reused": false
  },
  {
    "id": "annual",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/annual.html",
    "url": "https://www.sec.gov/Archives/edgar/data/874761/000087476126000063/aes-20251231.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/874761/000087476126000063/aes-20251231.htm",
    "bytes": 4817,
    "sha256": "aa19ca400b17f877cbeabc6b5e978aa2a7de4ad19aa83fe0048f7983f7ba95e8",
    "httpStatus": 403,
    "historical": true,
    "reused": false
  },
  {
    "id": "certificate",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/certificate.html",
    "url": "https://www.sec.gov/Archives/edgar/data/874761/000104746909001899/a2190712zex-3_1.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/874761/000104746909001899/a2190712zex-3_1.htm",
    "bytes": 4817,
    "sha256": "e70ab2fbec85616d3fe2dcb4d0829bb825a69ef446f5b9e49f39543d948966b5",
    "httpStatus": 403,
    "historical": true,
    "reused": false
  },
  {
    "id": "company",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/company.html",
    "url": "https://www.aes.com/",
    "finalUrl": "https://www.aes.com/",
    "bytes": 222418,
    "sha256": "512cf95078e1ca8e0c6e20c670799a67c19d2cee58d40290fd1f2a9ae81e701a",
    "httpStatus": 200,
    "historical": false,
    "reused": false
  },
  {
    "id": "announcement",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/announcement.html",
    "url": "https://www.aes.com/energy-insights/consortium-led-global-infrastructure-partners-and-eqt-agrees-acquire-aes",
    "finalUrl": "https://www.aes.com/energy-insights/consortium-led-global-infrastructure-partners-and-eqt-agrees-acquire-aes",
    "bytes": 211135,
    "sha256": "d941121e0ba1d88d4400a4d3e3f9d4b95592e148d2ab0ab8c54fc288042b6aaf",
    "httpStatus": 200,
    "historical": false,
    "reused": false
  },
  {
    "id": "syndicated-announcement",
    "path": "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes/syndicated-announcement.html",
    "url": "https://www.prnewswire.com/news-releases/consortium-led-by-global-infrastructure-partners-and-eqt-agrees-to-acquire-aes-302700916.html",
    "finalUrl": "https://www.prnewswire.com/news-releases/consortium-led-by-global-infrastructure-partners-and-eqt-agrees-to-acquire-aes-302700916.html",
    "bytes": 228573,
    "sha256": "185c2c33e43ae721b1d1dcbd34045f4bd82eb6dbb645d1e068f0251c0ceb6363",
    "httpStatus": 200,
    "historical": false,
    "reused": false
  }
] as const;
export const AES_RENDERED=[
  {
    "file": "agreement-rendered-excerpt.txt",
    "sha256": "496b4eab1d46103366dba15ac91e2bc080ca66dbff5fb77871234bebe8a042e1"
  },
  {
    "file": "annual-rendered-excerpt.txt",
    "sha256": "b9073de4ad31b09c94e76fd85a0007cea167e08953320d68ad72ceaec81f4205"
  },
  {
    "file": "certificate-ax-excerpt.txt",
    "sha256": "c0f2b36a6b01a5c89ced0be8fb3aaabc36dd01c7949be925ba9a08a97f269ed9"
  },
  {
    "file": "q2-rendered-excerpts.txt",
    "sha256": "addd16b673982d5c4ea3a37ceb0d56ad341e49255da02c599e2c07f4054998b8"
  },
  {
    "file": "vote-rendered-excerpt.txt",
    "sha256": "f0907c6bfc12a7324592283a3aceedace111f43626617b25eb25304d44af9fd6"
  }
] as const;
export const AES_ALL_OWNER_IDS=["cmt5w9df6000twyyy3y57d5th"] as const;
export const AES_HASHES={sourceCapture:"1a21d7cd2fcb91a126a61de7db29907289d5fcb877c5f752157caa7463ee67ee",review:"ead523c3b0ee2f8d07db794e8705a887f9634553a9fa51d4f92e458819078680",redactions:"57caafe1454628a0c702e2ad2d5e4aec38a7381309c16ec4355212390cf96664",originalState:"1655fbe21933cc8737e5b369e55534ded1de89f7078f77a7d6dff6125f42c3ef"} as const;
const PUBLIC_COPIES:Record<string,{sha256:string;bytes:number}>={
 announcement:{sha256:"306074c08b5c9891d08f3f8d6a9c223f9e70c8c32044114ba873412f1b2fbe0d",bytes:211078},
 company:{sha256:"b40f795affa7ff2a9b3dc4215ff6d7fa4b865fe70a1a824b1abdce1aa19205c6",bytes:222361}
};
export const AES_SOURCES=AES_CAPTURE_SOURCES.map(s=>({...s,rawPath:s.path,rawSha256:s.sha256,rawBytes:s.bytes,
 path:PUBLIC_COPIES[s.id]?`${AES_SOURCE_ROOT}/${s.id}.sanitized.html`:s.path,
 sha256:PUBLIC_COPIES[s.id]?.sha256??s.sha256,bytes:PUBLIC_COPIES[s.id]?.bytes??s.bytes}));
