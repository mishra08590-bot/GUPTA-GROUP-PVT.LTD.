
export enum QCCategory {
  COATING_ADHESION = "RQC-BOP-Inco (Coating Adhesion)",
  SEGREGATION_REWORK = "Segregation/Rework Monitoring",
  WITHOUT_INVOICE = "Without Invoice Register",
  SAMPLING_PART = "Sampling Part Notebook",
  EXPORT_ONLY = "Export Only Data Register"
}

export type UserRole = 'admin' | 'staff' | 'worker';

export interface Worker {
  id: string;
  name: string;
  mobileNumber: string;
  employeeCode: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  role: UserRole;
  password?: string;
  permissions: QCCategory[];
  canViewHistory: boolean;
}

export interface QCRecord {
  id: string;
  category: QCCategory;
  date: string;
  partName: string;
  partNo?: string;
  workerId: string;
  workerName: string;
  result: 'OK' | 'NG' | 'PASS' | 'FAIL';
  remarks: string;
  timestamp: number;
  customFields: {
    [key: string]: any;
  };
}

export interface ChatFile {
  name: string;
  data: string;
  type: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  text: string;
  image?: string;
  file?: ChatFile;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}
