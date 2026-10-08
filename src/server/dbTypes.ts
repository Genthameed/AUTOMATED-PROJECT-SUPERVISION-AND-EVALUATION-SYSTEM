/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Prisma Model Interfaces & In-Memory/Database Type Contracts
 * =============================================================================
 */

import type { UserRole } from './rbac';
export type { UserRole };

export type ProjectStatus =
  | 'TOPIC_SUBMITTED'
  | 'PROPOSAL_APPROVED'
  | 'BENCHWORK_IN_PROGRESS'
  | 'INTERNAL_DEFENSE_CLEARED'
  | 'EXTERNAL_VIVA_READY'
  | 'COMPLETED'
  | 'REJECTED';

export type ClearanceStage =
  | 'BIOETHICS_GATEWAY'
  | 'BENCHWORK_COMPLETION'
  | 'TURNITIN_SIMILARITY'
  | 'FINANCIAL_FEES'
  | 'INTERNAL_PRE_DEFENSE'
  | 'EXTERNAL_SENATE_VIVA';

export type ClearanceStatus =
  | 'PENDING'
  | 'CLEARED'
  | 'FLAGGED_FOR_REVISION'
  | 'REJECTED';

export type BiosafetyLevel = 'BSL_1' | 'BSL_2' | 'BSL_3';

export type DefenseType =
  | 'PROPOSAL'
  | 'INTERNAL_PRE_DEFENSE'
  | 'EXTERNAL_VIVA_VOCE';

export type PanelRole =
  | 'PANEL_CHAIR_HOD'
  | 'LEAD_SUPERVISOR'
  | 'CO_SUPERVISOR'
  | 'INTERNAL_EXAMINER'
  | 'EXTERNAL_EXAMINER';

export type EvaluationStatus = 'DRAFT' | 'SUBMITTED' | 'CERTIFIED_BY_DEAN';

export interface User {
  id: string;
  email: string;
  passwordHash?: string | null;
  name: string;
  role: UserRole;
  identifier: string; // e.g. "CSC/2021/0445"
  department: string;
  faculty: string;
  specializationTrack?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  topic: string;
  abstract?: string | null;
  methodologyOverview?: string | null;
  targetMicroorganisms: string[];
  approvalStatus: ProjectStatus;
  completionPercentage: number;
  academicSession: string;
  studentId: string;
  supervisorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EthicsClearance {
  id: string;
  projectId: string;
  studentId: string;
  protocolNumber: string; // e.g. "ATBU/REC/2026/089"
  biosafetyLevel: BiosafetyLevel;
  clinicalSource: string;
  status: ClearanceStatus;
  approvalLetterUrl?: string | null;
  committeeReviewerId?: string | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
  approvalComments?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabLogbookEntry {
  id: string;
  projectId: string;
  assayDate: Date;
  experimentTitle: string;
  targetStrain: string;
  observations: string;
  reagentsUsed: string[];
  rawDatasetUrl?: string | null;
  photomicrographUrl?: string | null;
  isBenchVerified: boolean;
  isCertified?: boolean; // Statutory flag alias for lab technologist certification
  verifiedById?: string | null;
  verifiedAt?: Date | null;
  technologistRemarks?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlagiarismAudit {
  id: string;
  projectId: string;
  digitalReceiptId: string;
  similarityIndex: number;
  statutoryMaxLimit: number; // 15.0%
  isPassed: boolean;
  reportPdfUrl: string;
  internetSources?: number | null;
  publicationsMatch?: number | null;
  studentPapers?: number | null;
  auditDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Clearance {
  id: string;
  studentId: string;
  stage: ClearanceStage;
  status: ClearanceStatus;
  clearedById?: string | null;
  remarks?: string | null;
  clearedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefenseSchedule {
  id: string;
  type: DefenseType;
  datetime: Date;
  venue: string;
  assignedStudentId: string;
  projectId: string;
  status: string; // SCHEDULED, COMPLETED, CANCELLED
  createdAt: Date;
  updatedAt: Date;
}

export interface DefensePanelMember {
  id: string;
  defenseId: string;
  examinerId: string;
  role: PanelRole;
  hasAttended: boolean;
  signedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
  id: string;
  defenseId: string;
  evaluatorId: string;
  studentId: string;
  criteriaScores: Record<string, number>;
  totalScore: number;
  grade?: string | null;
  recommendation?: string | null;
  comments?: string | null;
  status: EvaluationStatus;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterScoreRollup {
  id: string;
  projectId: string;
  proposalScore: number;
  benchworkScore: number;
  internalDefenseScore: number;
  externalVivaScore?: number | null;
  finalWeightedTotal?: number | null;
  degreeClass?: string | null;
  isSenateApproved: boolean;
  senateApprovedAt?: Date | null;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
