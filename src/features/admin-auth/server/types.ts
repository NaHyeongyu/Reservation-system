export type AdminRole = "super_admin" | "branch_admin";
export type AdminStatus = "active" | "disabled";

export type AdminSession = {
  adminUserId: string;
  authUserId: string;
  loginId: string;
  role: AdminRole;
  status: AdminStatus;
  branchIds: string[];
};
