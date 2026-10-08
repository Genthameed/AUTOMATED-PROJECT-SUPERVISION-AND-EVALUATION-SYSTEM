/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Wet-Lab Certification Service (Chief Laboratory Technologist Workflow)
 * 
 * Enforces laboratory oversight, assay data veracity verification,
 * and automated unlocking of Gate 2 (BENCHWORK_COMPLETION).
 * =============================================================================
 */

import { db, AppDatabase } from './db';
import type { LabLogbookEntry, Clearance } from './dbTypes';
import { sendEmailAlert, recordAuditLog } from './notifications';
import { validateGate2Benchwork } from './clearanceWorkflow';

export interface CertifyBenchworkParams {
  logbookEntryIds: string[];
  technologistId: string;
  technologistRemarks?: string;
  database?: AppDatabase;
}

export interface CertifyBenchworkResult {
  success: boolean;
  certifiedCount: number;
  certifiedEntries: LabLogbookEntry[];
  gate2Unlocked: boolean;
  clearanceRecord?: Clearance;
  message: string;
}

/**
 * Service function: certifyBenchwork()
 * Used exclusively by the Chief Laboratory Technologist to inspect and authenticate
 * wet-lab experimental entries (e.g. plaque assays, host ranges, spectrophotometry OD600 curves).
 * 
 * Automatically evaluates whether all experimental criteria are satisfied to unlock Gate 2.
 */
export async function certifyBenchwork(
  params: CertifyBenchworkParams
): Promise<CertifyBenchworkResult> {
  const { logbookEntryIds, technologistId, technologistRemarks, database = db } = params;

  if (!logbookEntryIds || logbookEntryIds.length === 0) {
    throw new Error('Invalid parameter: logbookEntryIds array cannot be empty.');
  }

  // 1. Role-Based Verification: Must possess LAB_TECHNOLOGIST role
  const technologist = database.users.get(technologistId);
  if (!technologist) {
    throw new Error(`Authentication failure: User '${technologistId}' not found.`);
  }

  if (technologist.role !== 'LAB_TECHNOLOGIST' && technologist.role !== 'ADMIN') {
    recordAuditLog({
      actorId: technologistId,
      actorRole: technologist.role,
      action: 'UNAUTHORIZED_BENCHWORK_CERTIFICATION_ATTEMPT',
      resource: 'LAB_LOGBOOK',
      resourceId: logbookEntryIds.join(','),
      status: 'BLOCKED',
      metadata: { attemptedEntries: logbookEntryIds },
    });

    throw new Error(
      `Access Denied: Statutory wet-lab benchwork certification requires the 'LAB_TECHNOLOGIST' role. (Provided role: ${technologist.role})`
    );
  }

  // 2. Execute within an atomic transaction
  return database.$transaction(async (tx) => {
    const certifiedEntries: LabLogbookEntry[] = [];
    let studentId: string | null = null;
    let projectId: string | null = null;

    const certificationTimestamp = new Date();

    for (const entryId of logbookEntryIds) {
      const entry = tx.labLogbooks.get(entryId);
      if (!entry) {
        throw new Error(`Integrity error: Lab logbook record '${entryId}' does not exist.`);
      }

      // Update record with technologist verification and audit signature
      entry.isBenchVerified = true;
      entry.isCertified = true;
      entry.verifiedById = technologist.id;
      entry.verifiedAt = certificationTimestamp;
      if (technologistRemarks) {
        entry.technologistRemarks = technologistRemarks;
      }
      entry.updatedAt = certificationTimestamp;

      certifiedEntries.push(entry);

      if (!projectId) {
        projectId = entry.projectId;
        const project = tx.projects.get(projectId);
        if (project) {
          studentId = project.studentId;
        }
      }
    }

    if (!projectId || !studentId) {
      throw new Error('Integrity error: Unable to resolve parent project or candidate student.');
    }

    const project = tx.projects.get(projectId)!;
    const student = tx.users.get(studentId)!;
    const supervisor = tx.users.get(project.supervisorId);

    // 3. Automated Gate 2 Evaluation: Check if Gate 2 can now be unlocked
    const gate2Check = await validateGate2Benchwork(studentId, tx);
    let gate2Unlocked = false;
    let clearanceRecord: Clearance | undefined;

    if (gate2Check.passed) {
      gate2Unlocked = true;
      const clearanceKey = `${studentId}-BENCHWORK_COMPLETION`;

      clearanceRecord = {
        id: `clr-bench-${Date.now()}`,
        studentId,
        stage: 'BENCHWORK_COMPLETION',
        status: 'CLEARED',
        clearedById: technologist.id,
        remarks: `Certified by Chief Technologist ${technologist.name}. ${gate2Check.verifiedCount} wet-lab assays verified on bench.`,
        clearedAt: certificationTimestamp,
        createdAt: certificationTimestamp,
        updatedAt: certificationTimestamp,
      };

      tx.clearances.set(clearanceKey, clearanceRecord);

      // Advance project completion progress
      project.completionPercentage = Math.max(project.completionPercentage, 65.0);

      // Dispatch automated gate-unlock notification
      await sendEmailAlert({
        to: student.email,
        recipientName: student.name,
        subject: '🔬 [WET-LAB CERTIFIED] Gate 2 Benchwork Clearance Approved',
        urgency: 'HIGH',
        headline: 'Chief Laboratory Technologist Certified Your Benchwork Assays',
        message: `Mallam Ibrahim Danladi (Chief Lab Technologist) has certified your system implementation modules (plaque assays, growth curves, filtration). Gate 2 (BENCHWORK_COMPLETION) has been automatically UNLOCKED. You are now eligible to proceed to Turnitin Plagiarism Auditing.`,
        details: {
          verifiedAssays: certifiedEntries.map((e) => e.experimentTitle),
          timestamp: certificationTimestamp.toISOString(),
          remarks: technologistRemarks,
        },
      });

      if (supervisor) {
        await sendEmailAlert({
          to: supervisor.email,
          recipientName: supervisor.name,
          subject: `[LAB NOTIFICATION] Supervisee Benchwork Certified: ${student.name}`,
          urgency: 'NORMAL',
          headline: 'Wet-Lab Benchwork Certified for Defense Eligibility',
          message: `Chief Technologist has signed off on the experimental benchwork for ${student.name} (${project.topic}). Gate 2 clearance has been unlocked.`,
          details: { verifiedCount: certifiedEntries.length, studentId },
        });
      }
    } else {
      // Partially verified but more assays needed
      await sendEmailAlert({
        to: student.email,
        recipientName: student.name,
        subject: '🔬 [LAB UPDATE] Partial Lab Logbook Certification Signed',
        urgency: 'NORMAL',
        headline: 'Benchwork Entries Verified by Technologist',
        message: `${certifiedEntries.length} laboratory assay records have been verified. However, Gate 2 requires ${gate2Check.reason}`,
        details: {
          verifiedCount: certifiedEntries.length,
          pendingRemarks: gate2Check.reason,
        },
      });
    }

    // 4. Record Audit Trail
    recordAuditLog({
      actorId: technologist.id,
      actorRole: technologist.role,
      action: 'WET_LAB_BENCHWORK_CERTIFIED',
      resource: 'LAB_LOGBOOK',
      resourceId: logbookEntryIds.join(','),
      status: 'SUCCESS',
      metadata: {
        count: certifiedEntries.length,
        gate2Unlocked,
        studentId,
        projectId,
      },
    });

    const summaryMessage = gate2Unlocked
      ? `Successfully certified ${certifiedEntries.length} logbook assay(s). Gate 2 (BENCHWORK_COMPLETION) is now UNLOCKED and CLEARED for candidate ${student.name}.`
      : `Successfully certified ${certifiedEntries.length} logbook assay(s). More entries required to unlock Gate 2 (${gate2Check.reason}).`;

    return {
      success: true,
      certifiedCount: certifiedEntries.length,
      certifiedEntries,
      gate2Unlocked,
      clearanceRecord,
      message: summaryMessage,
    };
  });
}
