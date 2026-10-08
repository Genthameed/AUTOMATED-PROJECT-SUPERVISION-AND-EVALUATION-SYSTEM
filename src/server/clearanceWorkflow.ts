/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * The Statutory Clearance Pipeline (State Machine)
 * 
 * Enforces sequential academic gateways for Computer Science & Computing disciplines:
 * Gate 1: Research Ethics & Protocol Verification
 * Gate 2: Technical Methodology & Systems Benchmarking (Lead Systems Technologist sign-off)
 * Gate 3: Turnitin Plagiarism Audit (< 15% statutory NUC ceiling)
 * Gate 4: Departmental Internal Pre-Defense
 * Gate 5: Senate External Viva Voce Defense
 * =============================================================================
 */

import { db, AppDatabase } from './db';
import type { ClearanceStage, ClearanceStatus, DefenseType } from './dbTypes';
import { sendEmailAlert, sendHODAlert, recordAuditLog } from './notifications';

/**
 * Gateway definition and sequential order
 */
export const STATUTORY_GATEWAY_ORDER: ClearanceStage[] = [
  'BIOETHICS_GATEWAY',
  'BENCHWORK_COMPLETION',
  'TURNITIN_SIMILARITY',
  'INTERNAL_PRE_DEFENSE',
  'EXTERNAL_SENATE_VIVA',
];

export interface ClearanceGateResult {
  allowed: boolean;
  currentStage: ClearanceStage;
  targetStage: ClearanceStage;
  reason?: string;
  violations?: string[];
  blockers?: {
    stage: ClearanceStage;
    requiredAction: string;
  }[];
}

/**
 * Gate 1: Research Ethics & Protocol Clearance Validator
 * Cannot proceed without verified protocolNumber (e.g. ATBU/REC/2026/089).
 */
export async function validateGate1Bioethics(
  studentId: string,
  database: AppDatabase = db
): Promise<{ passed: boolean; reason?: string; protocolNumber?: string }> {
  // Find project
  const project = Array.from(database.projects.values()).find(
    (p) => p.studentId === studentId
  );
  if (!project) {
    return { passed: false, reason: 'No registered dissertation project found for candidate.' };
  }

  const ethics = Array.from(database.ethicsClearances.values()).find(
    (e) => e.projectId === project.id
  );

  if (!ethics) {
    return {
      passed: false,
      reason: 'No Institutional Bioethics & Pathogen Clearance application submitted.',
    };
  }

  if (!ethics.protocolNumber || ethics.protocolNumber.trim().length === 0) {
    return {
      passed: false,
      reason: 'Bioethics record lacks an official institutional protocol certificate number.',
    };
  }

  if (ethics.status !== 'CLEARED') {
    return {
      passed: false,
      reason: `Institutional Bioethics protocol ${ethics.protocolNumber} is currently ${ethics.status}. Must be CLEARED before wet-lab pathogen isolation.`,
    };
  }

  if (ethics.biosafetyLevel !== 'BSL_2' && ethics.biosafetyLevel !== 'BSL_1') {
    return {
      passed: false,
      reason: `Assigned Biosafety Level (${ethics.biosafetyLevel}) does not meet clinical pathogen containment standards.`,
    };
  }

  return { passed: true, protocolNumber: ethics.protocolNumber };
}

/**
 * Gate 2: Wet-Lab Benchwork Validator
 * Validates that candidate has logged required system implementation modules and that
 * the Chief Laboratory Technologist (LAB_TECHNOLOGIST) has verified the entries.
 */
export async function validateGate2Benchwork(
  studentId: string,
  database: AppDatabase = db
): Promise<{ passed: boolean; reason?: string; verifiedCount: number; pendingCount: number }> {
  const project = Array.from(database.projects.values()).find(
    (p) => p.studentId === studentId
  );
  if (!project) {
    return { passed: false, reason: 'Project not found.', verifiedCount: 0, pendingCount: 0 };
  }

  const entries = Array.from(database.labLogbooks.values()).filter(
    (entry) => entry.projectId === project.id
  );

  if (entries.length === 0) {
    return {
      passed: false,
      reason: 'No laboratory logbook records submitted for experimental benchwork.',
      verifiedCount: 0,
      pendingCount: 0,
    };
  }

  const verifiedEntries = entries.filter(
    (e) => e.isBenchVerified === true || e.isCertified === true
  );
  const pendingEntries = entries.filter(
    (e) => !e.isBenchVerified && !e.isCertified
  );

  // Statutory requirement: Candidate must have at least 2 verified core assays
  // (e.g. plaque assay titration and spectrophotometric growth curve)
  if (verifiedEntries.length < 2) {
    return {
      passed: false,
      reason: `Only ${verifiedEntries.length} out of ${entries.length} logbook assays have been certified by the Chief Laboratory Technologist. Minimum 2 verified assays required for Gate 2.`,
      verifiedCount: verifiedEntries.length,
      pendingCount: pendingEntries.length,
    };
  }

  return {
    passed: true,
    verifiedCount: verifiedEntries.length,
    pendingCount: pendingEntries.length,
  };
}

/**
 * Gate 3: Turnitin Similarity Audit Validator
 * Strictly enforces the statutory university similarity ceiling (< 15.0%).
 * If similarityIndex > 15%, automatically flags project, records audit log, and alerts HOD.
 */
export async function validateGate3Plagiarism(
  studentId: string,
  database: AppDatabase = db
): Promise<{ passed: boolean; similarityIndex: number; receiptId?: string; reason?: string }> {
  const project = Array.from(database.projects.values()).find(
    (p) => p.studentId === studentId
  );
  if (!project) {
    return { passed: false, similarityIndex: 100, reason: 'Candidate project not found.' };
  }

  const audit = Array.from(database.plagiarismAudits.values()).find(
    (a) => a.projectId === project.id
  );

  if (!audit) {
    return {
      passed: false,
      similarityIndex: 100,
      reason: 'No official Turnitin similarity audit report lodged in the system.',
    };
  }

  // Statutory NUC Rule: Maximum 15.0%
  const STATUTORY_THRESHOLD = audit.statutoryMaxLimit || 15.0;

  if (audit.similarityIndex > STATUTORY_THRESHOLD) {
    // AUTOMATION TRIGGER: Flag project and dispatch alert to HOD
    project.approvalStatus = 'REJECTED'; // Blocked from defense progression
    audit.isPassed = false;

    // Record institutional audit log
    recordAuditLog({
      actorId: 'SYSTEM_AUDITOR',
      actorRole: 'AUTOMATED_GOVERNANCE',
      action: 'TURNITIN_THRESHOLD_BREACH',
      resource: 'PLAGIARISM_AUDIT',
      resourceId: audit.id,
      status: 'FLAGGED',
      metadata: {
        studentId,
        projectId: project.id,
        similarityIndex: audit.similarityIndex,
        statutoryLimit: STATUTORY_THRESHOLD,
        digitalReceipt: audit.digitalReceiptId,
      },
    });

    // Alert HOD and Lead Supervisor
    const hod = Array.from(database.users.values()).find(
      (u) => u.role === 'HEAD_OF_DEPARTMENT'
    );
    const supervisor = database.users.get(project.supervisorId);

    if (hod) {
      await sendHODAlert(
        hod.email,
        `PLAGIARISM CEILING BREACH: ${project.topic}`,
        `Candidate Exceeded 15% Statutory Similarity Threshold (${audit.similarityIndex}%)`,
        `Student Adama Bello (Matric: CSC/2021/0445) lodged Turnitin receipt ${audit.digitalReceiptId} with similarity index ${audit.similarityIndex}%, exceeding the statutory limit of ${STATUTORY_THRESHOLD}%. Defense progression has been automatically blocked pending dissertation revision.`,
        {
          similarityIndex: audit.similarityIndex,
          maxAllowed: STATUTORY_THRESHOLD,
          internetSources: audit.internetSources,
          publicationsMatch: audit.publicationsMatch,
          receiptId: audit.digitalReceiptId,
        }
      );
    }

    if (supervisor) {
      await sendEmailAlert({
        to: supervisor.email,
        recipientName: supervisor.name,
        subject: `[ACTION REQUIRED] Turnitin Flag for Supervisee (${audit.similarityIndex}%)`,
        urgency: 'HIGH',
        headline: 'Supervisee Dissertation Similarity Exceeds Institutional Tolerance',
        message: `Your supervisee's dissertation similarity index is ${audit.similarityIndex}%. Defense clearances cannot be issued until revision reduces similarity below 15.0%.`,
        details: { similarityIndex: audit.similarityIndex, threshold: STATUTORY_THRESHOLD },
      });
    }

    return {
      passed: false,
      similarityIndex: audit.similarityIndex,
      receiptId: audit.digitalReceiptId,
      reason: `Statutory similarity index of ${audit.similarityIndex}% exceeds the maximum permissible limit of ${STATUTORY_THRESHOLD}%. Defense scheduling blocked.`,
    };
  }

  // Audit Passed
  audit.isPassed = true;
  return {
    passed: true,
    similarityIndex: audit.similarityIndex,
    receiptId: audit.digitalReceiptId,
  };
}

/**
 * State Machine Sequential Clearance Pipeline Controller
 * Verifies that prerequisite gates are satisfied in strict sequence before allowing transition.
 * 
 * Rejects any attempt to jump gates (e.g. attempting Gate 4 without Gate 1, 2, and 3).
 */
export async function validateClearanceGate(
  studentId: string,
  targetStage: ClearanceStage,
  database: AppDatabase = db
): Promise<ClearanceGateResult> {
  const targetIndex = STATUTORY_GATEWAY_ORDER.indexOf(targetStage);
  if (targetIndex === -1) {
    throw new Error(`Invalid statutory clearance stage: ${targetStage}`);
  }

  const blockers: { stage: ClearanceStage; requiredAction: string }[] = [];
  const violations: string[] = [];

  // 1. Check Gate 1: Bioethics & Pathogen Clearance
  if (targetIndex >= 1) {
    const gate1 = await validateGate1Bioethics(studentId, database);
    if (!gate1.passed) {
      violations.push(`Gate 1 Failed: ${gate1.reason}`);
      blockers.push({
        stage: 'BIOETHICS_GATEWAY',
        requiredAction: 'Obtain certified Institutional Research Ethics Protocol code and ethical sign-off.',
      });
    }
  }

  // 2. Check Gate 2: Wet-Lab Benchwork Certification
  if (targetIndex >= 2) {
    const gate2 = await validateGate2Benchwork(studentId, database);
    if (!gate2.passed) {
      violations.push(`Gate 2 Failed: ${gate2.reason}`);
      blockers.push({
        stage: 'BENCHWORK_COMPLETION',
        requiredAction: 'Request Chief Laboratory Technologist certification on wet-lab experimental logbooks.',
      });
    }
  }

  // 3. Check Gate 3: Turnitin Similarity Audit (< 15%)
  if (targetIndex >= 3) {
    const gate3 = await validateGate3Plagiarism(studentId, database);
    if (!gate3.passed) {
      violations.push(`Gate 3 Failed: ${gate3.reason}`);
      blockers.push({
        stage: 'TURNITIN_SIMILARITY',
        requiredAction: 'Submit dissertation manuscript to Turnitin and achieve similarity index < 15.0%.',
      });
    }
  }

  // 4. Check Gate 4: Departmental Pre-Defense clearance before External Senate Viva (Gate 5)
  if (targetIndex >= 4) {
    const internalClearanceKey = `${studentId}-INTERNAL_PRE_DEFENSE`;
    const internalClearance = database.clearances.get(internalClearanceKey);
    if (!internalClearance || internalClearance.status !== 'CLEARED') {
      violations.push('Gate 4 Failed: Departmental Pre-Defense has not been evaluated and cleared.');
      blockers.push({
        stage: 'INTERNAL_PRE_DEFENSE',
        requiredAction: 'Pass Departmental Pre-Defense examination panel and obtain HOD endorsement.',
      });
    }
  }

  const allowed = blockers.length === 0;
  const currentStage = allowed
    ? targetStage
    : targetIndex > 0
    ? STATUTORY_GATEWAY_ORDER[targetIndex - 1]
    : 'BIOETHICS_GATEWAY';

  return {
    allowed,
    currentStage,
    targetStage,
    reason: allowed
      ? `All prerequisite gateway stages successfully cleared. Authorized for ${targetStage}.`
      : `Cannot advance to ${targetStage}. Sequential gate dependencies are unmet.`,
    violations: violations.length > 0 ? violations : undefined,
    blockers: blockers.length > 0 ? blockers : undefined,
  };
}

/**
 * Enforces Gate Progression: Attempts to officially advance a student to the requested stage.
 * Executes within a transactional boundary and dispatches automated notifications.
 */
export async function advanceClearanceStage(
  studentId: string,
  targetStage: ClearanceStage,
  actor: { id: string; role: string; name: string },
  remarks: string,
  database: AppDatabase = db
): Promise<{ success: boolean; stage: ClearanceStage; clearanceRecordId?: string; message: string }> {
  return database.$transaction(async (tx) => {
    // 1. Run strict sequential gateway validation
    const validation = await validateClearanceGate(studentId, targetStage, tx);

    if (!validation.allowed) {
      recordAuditLog({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'CLEARANCE_STAGE_ADVANCE_REJECTED',
        resource: 'CLEARANCE',
        resourceId: `${studentId}-${targetStage}`,
        status: 'BLOCKED',
        metadata: { studentId, targetStage, blockers: validation.blockers },
      });

      throw new Error(
        `STATUTORY GATEWAY BLOCKED: ${validation.reason} [${validation.violations?.join('; ')}]`
      );
    }

    // 2. Create or update clearance record for targetStage
    const clearanceKey = `${studentId}-${targetStage}`;
    const clearanceId = `clr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const clearanceRecord = {
      id: clearanceId,
      studentId,
      stage: targetStage,
      status: 'CLEARED' as ClearanceStatus,
      clearedById: actor.id,
      remarks,
      clearedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tx.clearances.set(clearanceKey, clearanceRecord);

    // 3. Update project completion progress and approval status
    const project = Array.from(tx.projects.values()).find((p) => p.studentId === studentId);
    if (project) {
      if (targetStage === 'BIOETHICS_GATEWAY') {
        project.approvalStatus = 'BENCHWORK_IN_PROGRESS';
        project.completionPercentage = Math.max(project.completionPercentage, 35.0);
      } else if (targetStage === 'BENCHWORK_COMPLETION') {
        project.completionPercentage = Math.max(project.completionPercentage, 65.0);
      } else if (targetStage === 'TURNITIN_SIMILARITY') {
        project.completionPercentage = Math.max(project.completionPercentage, 80.0);
      } else if (targetStage === 'INTERNAL_PRE_DEFENSE') {
        project.approvalStatus = 'INTERNAL_DEFENSE_CLEARED';
        project.completionPercentage = Math.max(project.completionPercentage, 90.0);
      } else if (targetStage === 'EXTERNAL_SENATE_VIVA') {
        project.approvalStatus = 'EXTERNAL_VIVA_READY';
        project.completionPercentage = 100.0;
      }
    }

    // 4. Audit Log
    recordAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLEARANCE_STAGE_ADVANCED',
      resource: 'CLEARANCE',
      resourceId: clearanceRecord.id,
      status: 'SUCCESS',
      metadata: { studentId, stage: targetStage, remarks },
    });

    // 5. Automated Notification Dispatch
    const student = tx.users.get(studentId);
    if (student) {
      await sendEmailAlert({
        to: student.email,
        recipientName: student.name,
        subject: `[GATEWAY CLEARED] Congratulations! You have unlocked ${targetStage}`,
        urgency: 'NORMAL',
        headline: `Academic Clearance Milestone Passed: ${targetStage}`,
        message: `Your clearance milestone for '${targetStage}' has been certified by ${actor.name}. You are now eligible to proceed to the next academic phase.`,
        details: { clearedBy: actor.name, role: actor.role, remarks },
      });
    }

    return {
      success: true,
      stage: targetStage,
      clearanceRecordId: clearanceRecord.id,
      message: `Successfully advanced candidate to statutory gateway: ${targetStage}`,
    };
  });
}

/**
 * Gate Guard for Defense Scheduling:
 * Strictly verifies that a candidate cannot be scheduled for a defense session without the required prerequisite clearances.
 */
export async function canScheduleDefense(
  studentId: string,
  defenseType: DefenseType,
  database: AppDatabase = db
): Promise<{ canSchedule: boolean; reason?: string }> {
  if (defenseType === 'PROPOSAL') {
    // Proposal defense requires topic formulation
    return { canSchedule: true };
  }

  if (defenseType === 'INTERNAL_PRE_DEFENSE') {
    // Internal Pre-Defense requires:
    // 1. Gate 1 (Bioethics)
    // 2. Gate 2 (Wet-Lab Benchwork)
    // 3. Gate 3 (Turnitin Similarity < 15%)
    const validation = await validateClearanceGate(studentId, 'INTERNAL_PRE_DEFENSE', database);
    if (!validation.allowed) {
      return {
        canSchedule: false,
        reason: `Cannot schedule Internal Pre-Defense: ${validation.reason} [${validation.violations?.join('; ')}]`,
      };
    }
    return { canSchedule: true };
  }

  if (defenseType === 'EXTERNAL_VIVA_VOCE') {
    // External Senate Viva requires all previous gates PLUS cleared Internal Pre-Defense
    const validation = await validateClearanceGate(studentId, 'EXTERNAL_SENATE_VIVA', database);
    if (!validation.allowed) {
      return {
        canSchedule: false,
        reason: `Cannot schedule External Senate Viva: ${validation.reason} [${validation.violations?.join('; ')}]`,
      };
    }
    return { canSchedule: true };
  }

  return { canSchedule: false, reason: 'Unrecognized defense type.' };
}
