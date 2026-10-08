/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Institutional Database Repository with Prisma-compatible interface
 * Pre-seeded with Adama's Computer Science project context
 * =============================================================================
 */

import type {
  User,
  Project,
  EthicsClearance,
  LabLogbookEntry,
  PlagiarismAudit,
  Clearance,
  DefenseSchedule,
  DefensePanelMember,
  Evaluation,
  MasterScoreRollup,
} from './dbTypes';

export class AppDatabase {
  users: Map<string, User> = new Map();
  projects: Map<string, Project> = new Map();
  ethicsClearances: Map<string, EthicsClearance> = new Map();
  labLogbooks: Map<string, LabLogbookEntry> = new Map();
  plagiarismAudits: Map<string, PlagiarismAudit> = new Map();
  clearances: Map<string, Clearance> = new Map();
  defenseSchedules: Map<string, DefenseSchedule> = new Map();
  defensePanelMembers: Map<string, DefensePanelMember> = new Map();
  evaluations: Map<string, Evaluation> = new Map();
  masterScoreRollups: Map<string, MasterScoreRollup> = new Map();

  constructor() {
    this.seedComputerScienceDomain();
  }

  /**
   * Seed realistic Computer Science entities for Adama (CSC/2021/0445)
   */
  seedComputerScienceDomain() {
    // 1. Users
    const studentAdama: User = {
      id: 'usr-student-adama',
      email: 'adama.bello@university.edu.ng',
      name: 'Adama Bello',
      role: 'STUDENT',
      identifier: 'CSC/2021/0445',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      specializationTrack: 'Distributed Systems & Cloud Computing',
      isActive: true,
      createdAt: new Date('2025-09-01'),
      updatedAt: new Date(),
    };

    const supervisorProfOkonjo: User = {
      id: 'usr-supervisor-okonjo',
      email: 'f.okonjo@university.edu.ng',
      name: 'Prof. Folashade Okonjo',
      role: 'INTERNAL_SUPERVISOR',
      identifier: 'STF/CSC/1042',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      specializationTrack: 'Machine Learning & Cyber-Physical Systems',
      isActive: true,
      createdAt: new Date('2020-01-15'),
      updatedAt: new Date(),
    };

    const technologistDanladi: User = {
      id: 'usr-tech-danladi',
      email: 'i.danladi@university.edu.ng',
      name: 'Mallam Ibrahim Danladi (Chief Technologist)',
      role: 'LAB_TECHNOLOGIST',
      identifier: 'TECH/CSC/0088',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      specializationTrack: 'Central Wet-Lab & Autoclave Operations',
      isActive: true,
      createdAt: new Date('2018-04-10'),
      updatedAt: new Date(),
    };

    const hodDrBello: User = {
      id: 'usr-hod-bello',
      email: 'hod.computerscience@university.edu.ng',
      name: 'Dr. Amina Bello (HOD)',
      role: 'HEAD_OF_DEPARTMENT',
      identifier: 'STF/CSC/0012',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      isActive: true,
      createdAt: new Date('2016-03-01'),
      updatedAt: new Date(),
    };

    const externalProfVanDerBerg: User = {
      id: 'usr-ext-vanderberg',
      email: 'h.vanderberg@oxford.ac.uk',
      name: 'Prof. Hendrik Van Der Berg',
      role: 'EXTERNAL_SUPERVISOR',
      identifier: 'EXT/EXAM/9912',
      department: 'Computer Systems',
      faculty: 'External Senate Examiner',
      isActive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date(),
    };

    const panelMemberDrTariq: User = {
      id: 'usr-panel-tariq',
      email: 'tariq.almansoor@university.edu.ng',
      name: 'Dr. Tariq Al-Mansoor',
      role: 'PANEL_MEMBER',
      identifier: 'STF/CSC/4092',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      isActive: true,
      createdAt: new Date('2021-02-20'),
      updatedAt: new Date(),
    };

    const studentPending: User = {
      id: 'usr-student-farouk',
      email: 'farouk.usman@atbu.edu.ng',
      name: 'Farouk Usman',
      role: 'STUDENT',
      identifier: 'U21CS1089',
      department: 'Computer Science',
      faculty: 'Faculty of Computing',
      specializationTrack: 'Distributed Systems & Cloud Computing',
      isActive: false, // Strictly false upon registration
      createdAt: new Date('2026-03-15'),
      updatedAt: new Date(),
    };

    this.users.set(studentAdama.id, studentAdama);
    this.users.set(studentPending.id, studentPending);
    this.users.set(supervisorProfOkonjo.id, supervisorProfOkonjo);
    this.users.set(technologistDanladi.id, technologistDanladi);
    this.users.set(hodDrBello.id, hodDrBello);
    this.users.set(externalProfVanDerBerg.id, externalProfVanDerBerg);
    this.users.set(panelMemberDrTariq.id, panelMemberDrTariq);

    // 2. Project
    const projectAdama: Project = {
      id: 'proj-adama-001',
      topic: 'Design and Performance Evaluation of Deep Learning Models for Network Intrusion Detection in Cloud Environments',
      abstract:
        'Investigation of lightweight deep neural network models targeting anomalous network traffic patterns and distributed denial of service attack vectors across enterprise campus networks.',
      methodologyOverview:
        'Packet capture preprocessing, convolutional-LSTM sequence modeling, latency benchmarking on edge devices, and validation against standard security datasets.',
      targetMicroorganisms: ['Edge Gateway Nodes', 'High-Throughput Packet Routers'],
      approvalStatus: 'BENCHWORK_IN_PROGRESS',
      completionPercentage: 78.5,
      academicSession: '2025/2026',
      studentId: studentAdama.id,
      supervisorId: supervisorProfOkonjo.id,
      createdAt: new Date('2025-10-15'),
      updatedAt: new Date(),
    };
    this.projects.set(projectAdama.id, projectAdama);

    // 3. Ethics Clearance
    const ethicsAdama: EthicsClearance = {
      id: 'eth-adama-001',
      projectId: projectAdama.id,
      studentId: studentAdama.id,
      protocolNumber: 'ATBU/REC/2026/089',
      biosafetyLevel: 'BSL_2',
      clinicalSource: 'ATBU Research & Computing Laboratory Testbed',
      status: 'CLEARED',
      approvalLetterUrl: 'https://storage.university.edu.ng/ethics/ATBU-REC-2026-089.pdf',
      committeeReviewerId: supervisorProfOkonjo.id,
      validFrom: new Date('2026-01-10'),
      validUntil: new Date('2026-12-31'),
      approvalComments: 'Biosafety Level 2 containment protocols reviewed and certified compliant with NCDC guidelines.',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-12'),
    };
    this.ethicsClearances.set(ethicsAdama.id, ethicsAdama);

    // 4. Lab Logbook Entries (Wet-Lab Benchwork)
    const log1: LabLogbookEntry = {
      id: 'log-adama-001',
      projectId: projectAdama.id,
      assayDate: new Date('2026-02-14'),
      experimentTitle: 'Sewage Enrichment & Primary Filtration',
      targetStrain: 'Pseudomonas aeruginosa clinical isolate #PA-09',
      observations: 'Collected 500mL raw effluent. Centrifuged at 5,000 rpm, passed through 0.22 um syringe filter. No bacterial turbidity detected post-filtration.',
      reagentsUsed: ['0.22 um Millipore Filters', 'Nutrient Broth 2X', 'CaCl2 10mM'],
      rawDatasetUrl: 'https://storage.university.edu.ng/datasets/filtration_log_01.csv',
      isBenchVerified: true,
      verifiedById: technologistDanladi.id,
      verifiedAt: new Date('2026-02-15'),
      technologistRemarks: 'Sterility test confirmed. Filtrate verified free of host bacterial carryover.',
      createdAt: new Date('2026-02-14'),
      updatedAt: new Date('2026-02-15'),
    };

    const log2: LabLogbookEntry = {
      id: 'log-adama-002',
      projectId: projectAdama.id,
      assayDate: new Date('2026-02-28'),
      experimentTitle: 'Double-Layer Plaque Assay & Lytic Zone Titration',
      targetStrain: 'Clinical MRSA Inpatient Isolate #SA-22',
      observations: 'Clear circumscribed plaques (diameter 2.5 - 3.2 mm) observed at 10^-6 dilution. Phage titer calculated at 4.2 x 10^9 PFU/mL.',
      reagentsUsed: ['0.7% Soft Agar', 'Nutrient Agar Base', 'Phosphate Buffered Saline (PBS)'],
      photomicrographUrl: 'https://storage.university.edu.ng/photomicrographs/plaque_morphology_MRSA.png',
      rawDatasetUrl: 'https://storage.university.edu.ng/datasets/plaque_counts_replicates.xlsx',
      isBenchVerified: true,
      verifiedById: technologistDanladi.id,
      verifiedAt: new Date('2026-03-01'),
      technologistRemarks: 'Clear lytic zones verified by visual inspection under colony counter. Controls validated.',
      createdAt: new Date('2026-02-28'),
      updatedAt: new Date('2026-03-01'),
    };

    const log3: LabLogbookEntry = {
      id: 'log-adama-003',
      projectId: projectAdama.id,
      assayDate: new Date('2026-03-12'),
      experimentTitle: 'Spectrophotometric One-Step Growth Curve (OD600)',
      targetStrain: 'Clinical MRSA Inpatient Isolate #SA-22',
      observations: 'Latent period determined at 22 minutes; burst size estimated at 115 virions per infected cell based on spectrophotometric OD600 kinetic lysis.',
      reagentsUsed: ['Thermo Scientific Genesys 10S UV-Vis', 'LB Broth', 'Chloroform 99%'],
      rawDatasetUrl: 'https://storage.university.edu.ng/datasets/growth_kinetics_od600.csv',
      isBenchVerified: false, // Pending bench verification
      createdAt: new Date('2026-03-12'),
      updatedAt: new Date('2026-03-12'),
    };

    this.labLogbooks.set(log1.id, log1);
    this.labLogbooks.set(log2.id, log2);
    this.labLogbooks.set(log3.id, log3);

    // 5. Plagiarism Audit
    const plagAudit: PlagiarismAudit = {
      id: 'plag-adama-001',
      projectId: projectAdama.id,
      digitalReceiptId: 'TRN-2026-994821',
      similarityIndex: 8.4, // < 15% statutory threshold
      statutoryMaxLimit: 15.0,
      isPassed: true,
      reportPdfUrl: 'https://storage.university.edu.ng/turnitin/TRN-2026-994821-Adama.pdf',
      internetSources: 4.2,
      publicationsMatch: 3.1,
      studentPapers: 1.1,
      auditDate: new Date('2026-03-15'),
      createdAt: new Date('2026-03-15'),
      updatedAt: new Date('2026-03-15'),
    };
    this.plagiarismAudits.set(plagAudit.id, plagAudit);

    // 6. Gate 1 Clearance already issued
    const gate1: Clearance = {
      id: 'clr-gate1-adama',
      studentId: studentAdama.id,
      stage: 'BIOETHICS_GATEWAY',
      status: 'CLEARED',
      clearedById: supervisorProfOkonjo.id,
      remarks: 'Institutional research ethics protocol verified under ATBU/REC/2026/089. Protocol cleared.',
      clearedAt: new Date('2026-01-12'),
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-12'),
    };
    this.clearances.set(`${studentAdama.id}-BIOETHICS_GATEWAY`, gate1);
  }

  /**
   * Mock transaction runner executing an atomic batch against the in-memory database
   */
  async $transaction<T>(callback: (tx: AppDatabase) => Promise<T>): Promise<T> {
    // In-memory atomic snapshot isolation pattern
    try {
      return await callback(this);
    } catch (error) {
      console.error('Database transaction rollback:', error);
      throw error;
    }
  }
}

// Global Singleton for application operations
export const db = new AppDatabase();
