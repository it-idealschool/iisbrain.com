import api from "./api";

export type EmployeeProfile={id:number;user:number|null;user_name?:string;employee_number:string;full_name:string;department:string;designation:string;employment_type:string;status:string;date_of_joining?:string;contract_expiry?:string;qatar_id:string;qatar_id_expiry?:string;phone:string;email:string;emergency_contact:string;annual_leave_entitlement:number};
export type LeaveRequest={id:number;employee:number;employee_name:string;leave_type:string;start_date:string;end_date:string;reason:string;status:string;status_label:string;total_days:number;created_at:string};
export type ServiceRequest={id:number;employee:number;employee_name:string;request_type:string;request_type_label:string;purpose:string;required_by?:string;status:string;status_label:string;created_at:string};
export type Appraisal={id:number;employee:number;employee_name:string;academic_year:string;performance_score:string;strengths:string;development_areas:string;goals:string;status:string;review_date:string;reviewer_name:string};

export const getEmployees=async()=>(await api.get("/hr/employees/")).data;
export const createEmployee=async(data:Partial<EmployeeProfile>)=>(await api.post("/hr/employees/",data)).data;
export const getLeaveRequests=async()=>(await api.get("/hr/leave-requests/")).data;
export const createLeaveRequest=async(data:Partial<LeaveRequest>)=>(await api.post("/hr/leave-requests/",data)).data;
export const approveLeaveRequest=async(id:number)=>(await api.post(`/hr/leave-requests/${id}/approve/`,{})).data;
export const getServiceRequests=async()=>(await api.get("/hr/service-requests/")).data;
export const createServiceRequest=async(data:Partial<ServiceRequest>)=>(await api.post("/hr/service-requests/",data)).data;
export const approveServiceRequest=async(id:number)=>(await api.post(`/hr/service-requests/${id}/approve/`,{})).data;
export const getAppraisals=async()=>(await api.get("/hr/appraisals/")).data;
export const createAppraisal=async(data:Partial<Appraisal>)=>(await api.post("/hr/appraisals/",data)).data;
