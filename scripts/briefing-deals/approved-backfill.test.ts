// @vitest-environment node
import {readFileSync} from "node:fs";
import {expect,it} from "vitest";
import {validateApprovedProposal} from "./domain";
const proposal=validateApprovedProposal(JSON.parse(readFileSync("audits/briefing-deals/approved-backfill-2026-11-03.json","utf8")));
it("covers all owner-approved cards without recreating known aliases or closing updates",()=>{
 expect(proposal.issues).toHaveLength(37);expect(proposal.decisions).toHaveLength(465);
 expect(proposal.decisions.filter(d=>d.action==='CREATE')).toHaveLength(176);
 expect(new Set(proposal.decisions.map(d=>d.canonicalId)).size).toBe(462);
 const rows=proposal.issues.flatMap(i=>i.cards.map(c=>({...c,edition:i.edition})));
 const decision=(edition:string,target:string)=>{const card=rows.find(c=>c.edition===edition&&c.target===target)!;return proposal.decisions.find(d=>d.edition===edition&&d.cardKey===card.key)!};
 expect(decision('2026-02-21','HyCC (Hydrogen Chemistry Company)').canonicalId).toBe('INF-2026-084');
 expect(decision('2026-03-14','48.4 MW Community Solar Portfolio (New Mexico)').canonicalId).toBe('INF-2026-128');
 expect(decision('2026-05-02','Nordergründe Offshore Wind Farm').canonicalId).toBe(decision('2026-07-03','Nordergrunde offshore wind farm').canonicalId);
 expect(proposal.duplicates).toHaveLength(1);
 expect(proposal.decisions.filter(d=>d.data?.publishExisting===true)).toHaveLength(15);
 expect(decision('2026-07-10','Sabey Data Center Properties').canonicalId).not.toBe(decision('2026-10-09','Sabey Data Center Properties').canonicalId);
 const kkr=['Cisternina Logistics','Central Tank Terminal','Central Terminal Korea'].map(t=>decision('2026-10-02',t).canonicalId);
 expect(new Set(kkr).size).toBe(3);
});
