export type AdminRole = "super_admin" | "branch_admin";
export type AdminStatus = "active" | "disabled";
export type AdminBranchStatus = "active" | "inactive" | "archived";

export type AdminBranchSnapshot = {
  id: string;
  name: string;
  status: AdminBranchStatus;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSession = {
  adminUserId: string;
  authUserId: string;
  loginId: string;
  role: AdminRole;
  status: AdminStatus;
  branchIds: string[];
  currentBranch: AdminBranchSnapshot | null;
};
