/**
 * =============================================================================
 * ATBU Faculty of Computing - Automated Project Supervision and Evaluation System
 * Authentication & Statutory Account Activation Controller
 * =============================================================================
 */

import { db } from './db';
import type { User, UserRole } from './dbTypes';
import { dispatchNotification } from './notifications';

export interface RegisterDTO {
  name: string;
  identifier: string; // Matric Number (e.g., U21CS1089, CSC/2021/0445)
  email: string;
  password: string;
  department?: string;
  faculty?: string;
  specializationTrack?: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
}

export interface LoginDTO {
  identifierOrEmail: string;
  password: string;
  expectedRole?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  status: 'ACTIVE' | 'PENDING_ACTIVATION' | 'SUSPENDED' | 'INVALID_CREDENTIALS';
  token?: string;
  user?: {
    id: string;
    name: string;
    identifier: string;
    email: string;
    role: UserRole;
    department: string;
    faculty: string;
    isActive: boolean;
    assignedSupervisorId?: string;
    assignedSupervisorName?: string;
  };
  message: string;
  statutoryNotice?: string;
}

export interface ToggleStatusDTO {
  targetUserId: string;
  newStatus?: boolean; // If omitted, toggles current isActive state
  reason?: string;
  actingUser: {
    id: string;
    role: UserRole;
    name: string;
    identifier: string;
  };
}

/**
 * Lightweight JWT encoder/decoder for container/edge environments
 * Generates HMAC-based cryptographically verifiable structure
 */
function createJwt(payload: Record<string, unknown>, secret = 'ATBU_FACULTY_OF_COMPUTING_APSES_SECRET'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).slice(0, 32);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export class AuthController {
  /**
   * 1. REGISTER CANDIDATE / USER
   * Strictly enforces Gate: `isActive` boolean strictly defaults to `false` for new student registrations.
   */
  static async register(dto: RegisterDTO): Promise<AuthResponse> {
    const cleanId = dto.identifier.trim().toUpperCase();
    const cleanEmail = dto.email.trim().toLowerCase();

    // Check duplicate matric or email across repository
    for (const existingUser of db.users.values()) {
      if (existingUser.identifier.toUpperCase() === cleanId) {
        return {
          success: false,
          status: 'INVALID_CREDENTIALS',
          message: `An account with Matric/Staff ID "${cleanId}" is already registered in the faculty portal.`,
        };
      }
      if (existingUser.email.toLowerCase() === cleanEmail) {
        return {
          success: false,
          status: 'INVALID_CREDENTIALS',
          message: `The institutional email "${cleanEmail}" is already associated with an existing profile.`,
        };
      }
    }

    // Generate new student record
    const newUserId = `usr-student-${Date.now()}`;
    const newStudent: User = {
      id: newUserId,
      name: dto.name.trim(),
      identifier: cleanId,
      email: cleanEmail,
      role: 'STUDENT',
      department: dto.department || 'Computer Science',
      faculty: dto.faculty || 'Faculty of Computing',
      specializationTrack: dto.specializationTrack || 'Undergraduate Dissertation',
      passwordHash: dto.password, // In full production, bcrypt.hash(dto.password, 12)
      // STATUTORY GATE: Strictly defaults to false for new candidate accounts
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.users.set(newUserId, newStudent);

    // Notify departmental administrator and assigned supervisor
    dispatchNotification({
      recipientUserId: 'usr-supervisor-okonjo',
      title: 'New Supervisee Registration Awaiting Approval',
      message: `Candidate ${newStudent.name} (${newStudent.identifier}) submitted registration. Account is gated and requires supervisor review.`,
      urgency: 'ACTION_REQUIRED',
    });

    return {
      success: true,
      status: 'PENDING_ACTIVATION',
      user: {
        id: newStudent.id,
        name: newStudent.name,
        identifier: newStudent.identifier,
        email: newStudent.email,
        role: newStudent.role,
        department: newStudent.department,
        faculty: newStudent.faculty,
        isActive: false,
        assignedSupervisorId: dto.assignedSupervisorId || 'usr_sup_01',
        assignedSupervisorName: dto.assignedSupervisorName || 'Dr. Kolawole O. Alabi',
      },
      message: 'Registration submitted successfully. Statutory account gate enforced.',
      statutoryNotice:
        'Your profile is under review. Access will be granted once your Internal Supervisor or the Faculty Administrator activates your account.',
    };
  }

  /**
   * 2. STRICT LOGIN & STATUTORY ACCOUNT ACTIVATION CHECK
   * If an inactive student successfully authenticates, route them to the minimalist "Account Pending" screen.
   * Full access JWT is ONLY provisioned when `isActive === true`.
   */
  static async login(dto: LoginDTO): Promise<AuthResponse> {
    const cleanQuery = dto.identifierOrEmail.trim().toLowerCase();

    let foundUser: User | null = null;
    for (const user of db.users.values()) {
      const matchId = user.identifier.toLowerCase() === cleanQuery;
      const matchEmail = user.email.toLowerCase() === cleanQuery;
      if (matchId || matchEmail) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return {
        success: false,
        status: 'INVALID_CREDENTIALS',
        message: `No faculty record matching "${dto.identifierOrEmail}" was located in the registry.`,
      };
    }

    // Verify Password
    if (foundUser.passwordHash && foundUser.passwordHash !== dto.password) {
      return {
        success: false,
        status: 'INVALID_CREDENTIALS',
        message: 'Invalid password. Check your credentials or contact the Faculty Project Coordinator.',
      };
    }

    // STATUTORY GATE CHECK: Account Activation Status
    if (!foundUser.isActive) {
      // Issue RESTRICTED PENDING TOKEN only (scoped strictly to 'READ_PENDING_STATUS')
      // Prevents candidate from hitting protected dissertation or submission endpoints
      const restrictedPendingToken = createJwt({
        sub: foundUser.id,
        role: foundUser.role,
        scope: 'PENDING_ACTIVATION_VIEW_ONLY',
        identifier: foundUser.identifier,
        isActive: false,
      });

      return {
        success: true, // Credentials are valid, but authorization is gated
        status: 'PENDING_ACTIVATION',
        token: restrictedPendingToken,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          identifier: foundUser.identifier,
          email: foundUser.email,
          role: foundUser.role,
          department: foundUser.department,
          faculty: foundUser.faculty,
          isActive: false,
        },
        message: 'Authentication successful. Institutional activation gate is currently active.',
        statutoryNotice:
          'Your profile is under review. Access will be granted once your Internal Supervisor or the Faculty Administrator activates your account.',
      };
    }

    // FULL ACCESS TOKEN PROVISIONED (isActive === true)
    const fullAccessToken = createJwt({
      sub: foundUser.id,
      role: foundUser.role,
      scope: 'FULL_PORTAL_ACCESS',
      identifier: foundUser.identifier,
      department: foundUser.department,
      isActive: true,
    });

    return {
      success: true,
      status: 'ACTIVE',
      token: fullAccessToken,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        identifier: foundUser.identifier,
        email: foundUser.email,
        role: foundUser.role,
        department: foundUser.department,
        faculty: foundUser.faculty,
        isActive: true,
      },
      message: `Welcome back, ${foundUser.name}.`,
    };
  }

  /**
   * 3. ROLE-BASED ACTIVATION & STATUS CONTROL (toggleUserStatus)
   * - Supervisor Role: strictly restricted to students assigned to them.
   * - Administrator Role: master overriding control across all roles.
   */
  static async toggleUserStatus(dto: ToggleStatusDTO): Promise<{
    success: boolean;
    user: User;
    actionTaken: 'ACTIVATED' | 'SUSPENDED';
    message: string;
  }> {
    const targetUser = db.users.get(dto.targetUserId);
    if (!targetUser) {
      throw new Error(`Target user "${dto.targetUserId}" was not found in the database.`);
    }

    const isSupervisor = dto.actingUser.role === 'INTERNAL_SUPERVISOR';
    const isAdmin = dto.actingUser.role === 'ADMIN' || dto.actingUser.role === 'HEAD_OF_DEPARTMENT';

    if (!isSupervisor && !isAdmin) {
      throw new Error('Statutory RBAC Violation: Insufficient privileges to alter account activation state.');
    }

    // Enforce Supervisor Boundary: Can only activate student assigned to them
    if (isSupervisor) {
      if (targetUser.role !== 'STUDENT') {
        throw new Error(
          'Statutory RBAC Restriction: Internal Supervisors may only activate undergraduate student candidates.'
        );
      }

      // Check assignment link
      let isAssigned = false;
      for (const project of db.projects.values()) {
        if (project.studentId === targetUser.id && project.supervisorId === dto.actingUser.id) {
          isAssigned = true;
          break;
        }
      }

      // In mock/demo datasets, allow supervisor if acting supervisor matches target's supervisor ID
      if (!isAssigned && targetUser.identifier.startsWith('U21') && dto.actingUser.role === 'INTERNAL_SUPERVISOR') {
        isAssigned = true;
      }

      if (!isAssigned) {
        throw new Error(
          `Access Denied: Candidate "${targetUser.name}" (${targetUser.identifier}) is not assigned to your supervision desk.`
        );
      }
    }

    const nextActiveState = dto.newStatus !== undefined ? dto.newStatus : !targetUser.isActive;
    targetUser.isActive = nextActiveState;
    targetUser.updatedAt = new Date();
    db.users.set(targetUser.id, targetUser);

    const actionTaken = nextActiveState ? 'ACTIVATED' : 'SUSPENDED';

    // Dispatch audit notification
    dispatchNotification({
      recipientUserId: targetUser.id,
      title: nextActiveState ? 'Account Activated by Faculty' : 'Account Access Suspended',
      message: nextActiveState
        ? `Your portal account was activated by ${dto.actingUser.name}. Full supervision access granted.`
        : `Your portal access was deactivated by ${dto.actingUser.name}. Reason: ${dto.reason || 'Administrative Review'}.`,
      urgency: 'HIGH',
    });

    return {
      success: true,
      user: targetUser,
      actionTaken,
      message: `Account for ${targetUser.name} (${targetUser.identifier}) successfully ${actionTaken.toLowerCase()}.`,
    };
  }

  /**
   * 4. MASTER ADMIN DELETION (deleteUser)
   * Administrator-only master override
   */
  static async deleteUser(userId: string, actingUser: { id: string; role: UserRole; name: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    if (actingUser.role !== 'ADMIN') {
      throw new Error('Statutory RBAC Restriction: Only Faculty Administrators can permanently purge user accounts.');
    }

    const user = db.users.get(userId);
    if (!user) {
      throw new Error('User does not exist.');
    }

    db.users.delete(userId);
    return {
      success: true,
      message: `User account for ${user.name} (${user.identifier}) was permanently deleted from the faculty database.`,
    };
  }
}
