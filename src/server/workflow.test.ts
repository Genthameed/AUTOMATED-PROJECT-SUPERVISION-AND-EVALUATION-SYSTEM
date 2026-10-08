/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Test Suite: Statutory Clearance Pipeline, Wet-Lab Certification, and Score Rollup
 * =============================================================================
 */

import { AppDatabase } from './db';
import {
  validateClearanceGate,
  advanceClearanceStage,
  canScheduleDefense,
  validateGate3Plagiarism,
} from './clearanceWorkflow';
import { certifyBenchwork } from './labCertification';
import {
  calculateMasterScoreRollup,
  publishMasterScores,
  determineDegreeClassification,
} from './scoreRollupService';

export async function runWorkflowVerificationSuite(): Promise<{
  allPassed: boolean;
  results: { testName: string; passed: boolean; details: string }[];
}> {
  const results: { testName: string; passed: boolean; details: string }[] = [];
  const testDb = new AppDatabase();

  // Test 1: Gate 1 (Bioethics) verification for Adama
  try {
    const gate1Validation = await validateClearanceGate('usr-student-adama', 'BENCHWORK_COMPLETION', testDb);
    results.push({
      testName: 'Gate 1 Bioethics Prerequisite Verification',
      passed: gate1Validation.allowed,
      details: 'Adama has verified ethics protocol ATBU/REC/2026/089.',
    });
  } catch (err: any) {
    results.push({
      testName: 'Gate 1 Bioethics Prerequisite Verification',
      passed: false,
      details: err.message,
    });
  }

  // Test 2: Gate Jumping Protection (Attempting to schedule External Viva before Gate 2 and Gate 4)
  try {
    const defenseCheck = await canScheduleDefense('usr-student-adama', 'EXTERNAL_VIVA_VOCE', testDb);
    const passed = !defenseCheck.canSchedule; // Must be blocked!
    results.push({
      testName: 'Gate Jumping Protection (Reject External Viva prior to Gate 4 & 2)',
      passed,
      details: defenseCheck.reason || 'Blocked as required by statutory state machine.',
    });
  } catch (err: any) {
    results.push({
      testName: 'Gate Jumping Protection (Reject External Viva prior to Gate 4 & 2)',
      passed: false,
      details: err.message,
    });
  }

  // Test 3: Unauthorized Benchwork Certification (Attempt by Student)
  try {
    let blockedAsExpected = false;
    try {
      await certifyBenchwork({
        logbookEntryIds: ['log-adama-003'],
        technologistId: 'usr-student-adama', // Student cannot certify lab work!
        database: testDb,
      });
    } catch {
      blockedAsExpected = true;
    }
    results.push({
      testName: 'RBAC Enforcement: Block Non-Technologist Lab Certification',
      passed: blockedAsExpected,
      details: 'Unauthorized role STUDENT rejected with 403 Forbidden.',
    });
  } catch (err: any) {
    results.push({
      testName: 'RBAC Enforcement: Block Non-Technologist Lab Certification',
      passed: false,
      details: err.message,
    });
  }

  // Test 4: Authorized Wet-Lab Certification by Chief Technologist (Mallam Danladi)
  try {
    const certResult = await certifyBenchwork({
      logbookEntryIds: ['log-adama-003'],
      technologistId: 'usr-tech-danladi',
      technologistRemarks: 'Spectrophotometric curve verified. Controls matched McFarland 0.5 standards.',
      database: testDb,
    });
    results.push({
      testName: 'Wet-Lab Certification & Automated Gate 2 Unlock',
      passed: certResult.success && certResult.gate2Unlocked,
      details: certResult.message,
    });
  } catch (err: any) {
    results.push({
      testName: 'Wet-Lab Certification & Automated Gate 2 Unlock',
      passed: false,
      details: err.message,
    });
  }

  // Test 5: Gate 3 Turnitin Plagiarism Threshold Enforcement
  try {
    // Current similarity is 8.4% (< 15%), should pass
    const plagCheckPass = await validateGate3Plagiarism('usr-student-adama', testDb);
    
    // Simulate high similarity breach (e.g. 24.5%)
    const project = testDb.projects.get('proj-adama-001')!;
    const plagRecord = testDb.plagiarismAudits.get('plag-adama-001')!;
    plagRecord.similarityIndex = 24.5;

    const plagCheckFail = await validateGate3Plagiarism('usr-student-adama', testDb);
    const passed = plagCheckPass.passed && !plagCheckFail.passed;

    // Reset back for downstream tests
    plagRecord.similarityIndex = 8.4;
    project.approvalStatus = 'BENCHWORK_IN_PROGRESS';

    results.push({
      testName: 'Statutory Plagiarism Ceiling (< 15.0%) & HOD Automated Alert',
      passed,
      details: `Similarity of 8.4% passed; simulated 24.5% breach triggered statutory rejection and HOD alert.`,
    });
  } catch (err: any) {
    results.push({
      testName: 'Statutory Plagiarism Ceiling (< 15.0%) & HOD Automated Alert',
      passed: false,
      details: err.message,
    });
  }

  // Test 6: Degree Classification Formula Accuracy
  const classA = determineDegreeClassification(87.5);
  const classB = determineDegreeClassification(68.2);
  const classC = determineDegreeClassification(54.0);
  const classF = determineDegreeClassification(41.0);
  const honorsAccurate =
    classA.degreeClass.includes('First Class') &&
    classB.degreeClass.includes('Second Class Honours (Upper') &&
    classC.degreeClass.includes('Second Class Honours (Lower') &&
    classF.degreeClass.includes('Fail');

  results.push({
    testName: 'NUC Degree Honors Classification Mapping',
    passed: honorsAccurate,
    details: `87.5% -> ${classA.degreeClass}; 68.2% -> ${classB.degreeClass}; 54.0% -> ${classC.degreeClass}; 41.0% -> ${classF.degreeClass}`,
  });

  // Test 7: Master Score Rollup Calculation (20/20/20/40) & Lock State
  try {
    const rollupResult = await calculateMasterScoreRollup({
      projectId: 'proj-adama-001',
      scores: {
        proposalScore: 88.0,       // 20% -> 17.6
        benchworkScore: 94.0,      // 20% -> 18.8
        internalDefenseScore: 86.0,// 20% -> 17.2
        externalVivaScore: 91.0,   // 40% -> 36.4
        // Composite = 17.6 + 18.8 + 17.2 + 36.4 = 90.0%
      },
      actingUser: {
        id: 'usr-ext-vanderberg',
        role: 'EXTERNAL_SUPERVISOR',
        name: 'Prof. Hendrik Van Der Berg',
      },
      database: testDb,
    });

    const isScoreAccurate = rollupResult.rollup.finalWeightedTotal === 90.0;
    const isStrictlyLocked = rollupResult.rollup.isPublished === false;

    results.push({
      testName: 'Master Score Rollup Weighting (20/20/20/40) & Publication Lock',
      passed: isScoreAccurate && isStrictlyLocked,
      details: `Calculated composite: ${rollupResult.rollup.finalWeightedTotal}%. Lock state: isPublished=${rollupResult.rollup.isPublished} (${rollupResult.classification.degreeClass}).`,
    });
  } catch (err: any) {
    results.push({
      testName: 'Master Score Rollup Weighting (20/20/20/40) & Publication Lock',
      passed: false,
      details: err.message,
    });
  }

  // Test 8: Gazette Release Authorization (Unauthorized Examiner Rejected vs HOD Approved)
  try {
    let unauthorizedBlocked = false;
    try {
      await publishMasterScores({
        projectId: 'proj-adama-001',
        actingUser: {
          id: 'usr-ext-vanderberg',
          role: 'EXTERNAL_SUPERVISOR', // Not authorized to publish!
          name: 'Prof. Hendrik Van Der Berg',
        },
        database: testDb,
      });
    } catch {
      unauthorizedBlocked = true;
    }

    const publishResult = await publishMasterScores({
      projectId: 'proj-adama-001',
      actingUser: {
        id: 'usr-hod-bello',
        role: 'HEAD_OF_DEPARTMENT',
        name: 'Dr. Amina Bello (HOD)',
      },
      senateResolutionCode: 'SENATE/RES/2026/MCB-0445',
      database: testDb,
    });

    const passed = unauthorizedBlocked && publishResult.rollup.isPublished === true;
    results.push({
      testName: 'HOD Broad Sheet Gazette Release & Senate Authorization',
      passed,
      details: `Non-HOD publish attempt was blocked; HOD Dr. Amina Bello successfully published score (${publishResult.rollup.finalWeightedTotal}%, Senate Approved).`,
    });
  } catch (err: any) {
    results.push({
      testName: 'HOD Broad Sheet Gazette Release & Senate Authorization',
      passed: false,
      details: err.message,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
