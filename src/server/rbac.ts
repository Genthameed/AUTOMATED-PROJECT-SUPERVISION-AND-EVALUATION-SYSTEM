/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Role-Based Access Control (RBAC) & Attribute-Based Access Control (ABAC) Engine
 * Tailored for Laboratory Sciences & Computer Science Workflow
 * 
 * Staff Principal Backend Engineer & Database Architect
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';

// -----------------------------------------------------------------------------
// 1. DOMAIN ENUMS & TYPES
// -----------------------------------------------------------------------------

export type UserRole =
  | 'STUDENT'
  | 'INTERNAL_SUPERVISOR'
  | 'PANEL_MEMBER'
  | 'EXTERNAL_SUPERVISOR'
  | 'LAB_TECHNOLOGIST'
  | 'HEAD_OF_DEPARTMENT'
  | 'ADMIN';

export type Resource =
  | 'PROJECT'
  | 'DOCUMENT'
  | 'MILESTONE'
  | 'MEETING'
  | 'DEFENSE_SCHEDULE'
  | 'EVALUATION'
  | 'CLEARANCE'
  | 'LAB_LOGBOOK'
  | 'ETHICS_CLEARANCE'
  | 'PLAGIARISM_AUDIT'
  | 'MASTER_SCORE'
  | 'USER';

export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'CERTIFY' | 'MANAGE' | '*';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  identifier: string; // e.g., "CSC/2021/0445" (Student) or Staff ID
  department: string;
}

export interface ResourceContext {
  resourceId?: string;
  studentId?: string;
  supervisorId?: string;
  technologistId?: string;
  assignedEvaluatorIds?: string[];
  panelRole?: 'PANEL_CHAIR_HOD' | 'LEAD_SUPERVISOR' | 'INTERNAL_EXAMINER' | 'EXTERNAL_EXAMINER';
  defenseType?: 'PROPOSAL' | 'INTERNAL_PRE_DEFENSE' | 'EXTERNAL_VIVA_VOCE';
  isPublished?: boolean;
  status?: string;
  department?: string;
  [key: string]: unknown;
}

export interface PermissionRule {
  resource: Resource;
  action: Action;
  condition?: (user: AuthUser, context?: ResourceContext) => boolean;
  description?: string;
}

// -----------------------------------------------------------------------------
// 2. ENHANCED ROLE PERMISSION MATRIX
// -----------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<UserRole, PermissionRule[]> = {
  // ---------------------------------------------------------------------------
  // STUDENT (Adama's Role):
  // - Reads own project, submitted documents, milestones, meetings
  // - Submits lab logbook entries and raw datasets for benchwork
  // - Submits bioethics application & Turnitin audit documents
  // - Can ONLY read evaluation rubrics if officially marked isPublished = true
  // ---------------------------------------------------------------------------
  STUDENT: [
    {
      resource: 'PROJECT',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ own dissertation project details',
    },
    {
      resource: 'DOCUMENT',
      action: 'CREATE',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can upload Proposal, Chapter drafts, and raw data files',
    },
    {
      resource: 'DOCUMENT',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ own uploaded documents & supervisor feedback',
    },
    {
      resource: 'LAB_LOGBOOK',
      action: 'CREATE',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can log wet-lab benchwork entries (plaque assays, titers, OD readings)',
    },
    {
      resource: 'LAB_LOGBOOK',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ own benchwork logs and technologist certifications',
    },
    {
      resource: 'ETHICS_CLEARANCE',
      action: 'CREATE',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can apply for institutional bio-ethics approval',
    },
    {
      resource: 'ETHICS_CLEARANCE',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ bio-ethics clearance status and certificate code',
    },
    {
      resource: 'PLAGIARISM_AUDIT',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ Turnitin similarity index (<15%) and certificate receipt',
    },
    {
      resource: 'MILESTONE',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ research stage-gate milestones',
    },
    {
      resource: 'MEETING',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can READ supervision meeting records and lab action items',
    },
    {
      resource: 'CLEARANCE',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.studentId || ctx.studentId === user.id,
      description: 'Can monitor stage-gate clearances (Bioethics, Benchwork, Turnitin, Senate)',
    },
    {
      resource: 'EVALUATION',
      action: 'READ',
      // Strict constraint: cannot peek into scores before published by HOD/Dean
      condition: (user, ctx) => {
        if (!ctx) return false;
        return ctx.studentId === user.id && ctx.isPublished === true;
      },
      description: 'Can READ evaluated viva voce scores ONLY when officially published',
    },
  ],

  // ---------------------------------------------------------------------------
  // LAB TECHNOLOGIST (Software Implementation Verification):
  // - Inspects benchwork, media prep, autoclave logs, and clinical isolate handling
  // - Certifies wet-lab logbooks and issues benchwork stage clearance
  // ---------------------------------------------------------------------------
  LAB_TECHNOLOGIST: [
    {
      resource: 'LAB_LOGBOOK',
      action: 'READ',
      description: 'Can inspect wet-lab logbooks and assay observations for all lab students',
    },
    {
      resource: 'LAB_LOGBOOK',
      action: 'CERTIFY',
      description: 'Can bench-verify and certify student laboratory experimental records',
    },
    {
      resource: 'CLEARANCE',
      action: 'UPDATE',
      description: 'Can endorse BENCHWORK_COMPLETION clearance for defense eligibility',
    },
    {
      resource: 'ETHICS_CLEARANCE',
      action: 'READ',
      description: 'Can inspect biosafety level (BSL-2) and ethical permits for pathogen isolation',
    },
    {
      resource: 'PROJECT',
      action: 'READ',
      description: 'Can READ student methodology and target microorganisms to allocate bench space',
    },
  ],

  // ---------------------------------------------------------------------------
  // INTERNAL SUPERVISOR:
  // - Manages allocatees, schedules meetings, creates milestones
  // - Reviews lab bench progress, marks document revisions, endorses clearances
  // ---------------------------------------------------------------------------
  INTERNAL_SUPERVISOR: [
    {
      resource: 'PROJECT',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can READ assigned supervisees dissertation records',
    },
    {
      resource: 'PROJECT',
      action: 'UPDATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can UPDATE project topic, status, and completion progress',
    },
    {
      resource: 'DOCUMENT',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can READ drafts, raw datasets, and lab logs submitted by supervisees',
    },
    {
      resource: 'DOCUMENT',
      action: 'UPDATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can annotate drafts with line-by-line feedback and review status',
    },
    {
      resource: 'LAB_LOGBOOK',
      action: 'READ',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can audit student benchwork assays and photomicrographs',
    },
    {
      resource: 'LAB_LOGBOOK',
      action: 'CERTIFY',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can co-sign wet-lab experimental veracity',
    },
    {
      resource: 'MILESTONE',
      action: 'CREATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can assign experimental and thesis writing milestones',
    },
    {
      resource: 'MILESTONE',
      action: 'UPDATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can mark milestones cleared or modify target deadlines',
    },
    {
      resource: 'MEETING',
      action: 'CREATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can schedule supervision sessions with agendas and action points',
    },
    {
      resource: 'CLEARANCE',
      action: 'UPDATE',
      condition: (user, ctx) => !ctx || !ctx.supervisorId || ctx.supervisorId === user.id,
      description: 'Can sign off supervisor stage-gate clearances',
    },
    {
      resource: 'EVALUATION',
      action: 'CREATE',
      description: 'Can submit supervisor continuous assessment marks (20% benchwork)',
    },
  ],

  // ---------------------------------------------------------------------------
  // PANEL MEMBER:
  // - Evaluates student during Proposal Defense & Internal Pre-Defense
  // ---------------------------------------------------------------------------
  PANEL_MEMBER: [
    {
      resource: 'DEFENSE_SCHEDULE',
      action: 'READ',
      condition: (user, ctx) => {
        if (!ctx || !ctx.assignedEvaluatorIds) return true;
        return ctx.assignedEvaluatorIds.includes(user.id);
      },
      description: 'Can view assigned defense sessions',
    },
    {
      resource: 'EVALUATION',
      action: 'CREATE',
      condition: (user, ctx) => {
        if (!ctx || !ctx.assignedEvaluatorIds) return true;
        return ctx.assignedEvaluatorIds.includes(user.id);
      },
      description: 'Can score candidates using the standardized viva rubric',
    },
    {
      resource: 'EVALUATION',
      action: 'UPDATE',
      condition: (user, ctx) => {
        if (!ctx) return true;
        return ctx.evaluatorId === user.id && ctx.status !== 'CERTIFIED_BY_DEAN';
      },
      description: 'Can adjust own rubric scores before final submission',
    },
    {
      resource: 'DOCUMENT',
      action: 'READ',
      description: 'Can read defense manuscript and presentation slides',
    },
    {
      resource: 'PLAGIARISM_AUDIT',
      action: 'READ',
      description: 'Can verify that Turnitin similarity is below statutory ceiling (<15%)',
    },
  ],

  // ---------------------------------------------------------------------------
  // EXTERNAL SUPERVISOR (Visiting Professor / External Examiner):
  // - Assigned exclusively to final viva voce sessions
  // - Evaluates dissertation quality, biological methodology, and oral defense
  // ---------------------------------------------------------------------------
  EXTERNAL_SUPERVISOR: [
    {
      resource: 'DEFENSE_SCHEDULE',
      action: 'READ',
      condition: (user, ctx) => {
        const isExternalViva = !ctx?.defenseType || ctx.defenseType === 'EXTERNAL_VIVA_VOCE';
        const isAssigned = !ctx?.assignedEvaluatorIds || ctx.assignedEvaluatorIds.includes(user.id);
        return isExternalViva && isAssigned;
      },
      description: 'Can view assigned final external viva voce sessions',
    },
    {
      resource: 'DOCUMENT',
      action: 'READ',
      description: 'Can review candidate final bound dissertation, raw datasets, and lab records',
    },
    {
      resource: 'ETHICS_CLEARANCE',
      action: 'READ',
      description: 'Can inspect institutional bioethics compliance and approval protocol',
    },
    {
      resource: 'PLAGIARISM_AUDIT',
      action: 'READ',
      description: 'Can review Turnitin digital certificate and matched source breakdown',
    },
    {
      resource: 'EVALUATION',
      action: 'CREATE',
      condition: (user, ctx) => {
        if (!ctx || !ctx.assignedEvaluatorIds) return true;
        return ctx.assignedEvaluatorIds.includes(user.id);
      },
      description: 'Can enter statutory External Examiner scores and degree recommendations',
    },
    {
      resource: 'EVALUATION',
      action: 'READ',
      condition: (user, ctx) => !ctx || ctx.evaluatorId === user.id,
      description: 'Can review entered statutory scorecards',
    },
  ],

  // ---------------------------------------------------------------------------
  // HEAD OF DEPARTMENT (HOD):
  // - Departmental quality assurance, broadsheet compilation, publishing scores
  // ---------------------------------------------------------------------------
  HEAD_OF_DEPARTMENT: [
    {
      resource: 'PROJECT',
      action: 'READ',
      description: 'Can oversee all departmental project topics and progress trajectories',
    },
    {
      resource: 'DEFENSE_SCHEDULE',
      action: 'CREATE',
      description: 'Can configure departmental defense panels and assign internal examiners',
    },
    {
      resource: 'CLEARANCE',
      action: 'UPDATE',
      description: 'Can issue final departmental pre-defense clearance to Senate',
    },
    {
      resource: 'EVALUATION',
      action: 'UPDATE',
      description: 'Can publish certified evaluation scores to students and registry',
    },
    {
      resource: 'MASTER_SCORE',
      action: 'UPDATE',
      description: 'Can compile and sign the departmental broadsheet and score gazette',
    },
  ],

  // ---------------------------------------------------------------------------
  // ADMIN:
  // - Full institutional registry and system oversight
  // ---------------------------------------------------------------------------
  ADMIN: [
    { resource: 'PROJECT', action: '*' },
    { resource: 'DOCUMENT', action: '*' },
    { resource: 'MILESTONE', action: '*' },
    { resource: 'MEETING', action: '*' },
    { resource: 'DEFENSE_SCHEDULE', action: '*' },
    { resource: 'EVALUATION', action: '*' },
    { resource: 'CLEARANCE', action: '*' },
    { resource: 'LAB_LOGBOOK', action: '*' },
    { resource: 'ETHICS_CLEARANCE', action: '*' },
    { resource: 'PLAGIARISM_AUDIT', action: '*' },
    { resource: 'MASTER_SCORE', action: '*' },
    { resource: 'USER', action: 'MANAGE' },
    { resource: 'USER', action: '*' },
  ],
};

// -----------------------------------------------------------------------------
// 3. CORE can() EVALUATION ENGINE
// -----------------------------------------------------------------------------

export function can(
  user: AuthUser,
  action: Action,
  resource: Resource,
  context?: ResourceContext
): boolean {
  if (!user || !user.role) return false;

  // System Administrator has universal wildcard bypass
  if (user.role === 'ADMIN') return true;

  const rules = ROLE_PERMISSIONS[user.role];
  if (!rules || rules.length === 0) return false;

  for (const rule of rules) {
    const resourceMatch = rule.resource === resource || (rule.resource as string) === '*';
    const actionMatch = rule.action === action || rule.action === '*' || rule.action === 'MANAGE';

    if (resourceMatch && actionMatch) {
      if (rule.condition) {
        if (rule.condition(user, context)) return true;
      } else {
        return true;
      }
    }
  }

  return false;
}

// -----------------------------------------------------------------------------
// 4. EXPRESS RBAC / ABAC MIDDLEWARE FACTORY
// -----------------------------------------------------------------------------

export type ContextExtractor = (
  req: Request
) => Promise<ResourceContext> | ResourceContext;

export function authorize(
  resource: Resource,
  action: Action,
  contextExtractor?: ContextExtractor
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as Request & { user?: AuthUser }).user;

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication token required.',
        });
        return;
      }

      let context: ResourceContext | undefined;
      if (contextExtractor) {
        context = await contextExtractor(req);
      } else {
        context = {
          studentId: (req.params.studentId || req.body?.studentId || req.query?.studentId) as string,
          supervisorId: (req.params.supervisorId || req.body?.supervisorId) as string,
          resourceId: req.params.id,
        };
      }

      const isAllowed = can(user, action, resource, context);

      if (!isAllowed) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Role '${user.role}' lacks permission for '${action}' on '${resource}'.`,
          required: { resource, action },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
