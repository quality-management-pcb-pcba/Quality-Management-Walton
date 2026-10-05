export interface ManpowerEmployee {
  sl: number;
  name: string;
  employeeId: string;
  department: string;
  section: 'SMT' | 'MI' | 'PCB' | string;
  designation?: string;
  shift?: string;
  phone?: string;
  email?: string;
  status: 'Active' | 'On Leave' | 'Transferred' | string;
  updatedAt?: number;
}

/**
 * Walton Quality Management Directorate - Official Manpower List
 * Extracted from official QM Department staff roster
 * Total: 31 employees across SMT (15), MI (3), and PCB (13) sections
 */
export const MANPOWER_LIST_RECORDS: ManpowerEmployee[] = [
  { sl: 1, name: 'Rubel Hosen', employeeId: '37078', department: 'QM', section: 'SMT', status: 'Active', designation: 'Senior QA Inspector' },
  { sl: 2, name: 'Abu Saeed Ali', employeeId: '63929', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 3, name: 'Mazidul Islam', employeeId: '64218', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 4, name: 'Masum Miah', employeeId: '64193', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 5, name: 'Md. Ariful Islam', employeeId: '63725', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 6, name: 'Abdul Wahab', employeeId: '64410', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 7, name: 'Sabbir Hossain', employeeId: '64395', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 8, name: 'Md. Nazmul Haque', employeeId: '64411', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 9, name: 'Mamun Rana', employeeId: '64006', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 10, name: 'Nazmul Islam', employeeId: '64227', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 11, name: 'Gibon Miah', employeeId: '64848', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 12, name: 'Sazzad', employeeId: '39911', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 13, name: 'Anik Sutradhar', employeeId: '50280', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 14, name: 'Shuvo Kumar Das', employeeId: '50282', department: 'QM', section: 'MI', status: 'Active', designation: 'QA Inspector' },
  { sl: 15, name: 'Md. Shajahan', employeeId: '47276', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 16, name: 'Abdullah Al Mamun', employeeId: '53129', department: 'QM', section: 'SMT', status: 'Active', designation: 'QA Inspector' },
  { sl: 17, name: 'Md. Masud Rana', employeeId: '15065', department: 'QM', section: 'MI', status: 'Active', designation: 'Senior QA Inspector' },
  { sl: 18, name: 'Md. Rony Khan', employeeId: '14873', department: 'QM', section: 'MI', status: 'Active', designation: 'Senior QA Inspector' },
  { sl: 19, name: 'Md. Rokibuzzaman', employeeId: '34484', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 20, name: 'Md. Anisur Rahman', employeeId: '38637', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 21, name: 'Raton Chandra Barmon', employeeId: '43568', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 22, name: 'Md. Hasan', employeeId: '69172', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 23, name: 'Shepon Khan', employeeId: '64222', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 24, name: 'Shakhawat Hossain', employeeId: '69114', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 25, name: 'Md. Abdul Khalek', employeeId: '38632', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 26, name: 'Md. Asraful Alom', employeeId: '34511', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 27, name: 'Rubel Miah', employeeId: '54133', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 28, name: 'Akter Jahan Shelly', employeeId: '17577', department: 'QM', section: 'PCB', status: 'Active', designation: 'Senior QA Inspector' },
  { sl: 29, name: 'Chandana Rani Das', employeeId: '1354', department: 'QM', section: 'PCB', status: 'Active', designation: 'Senior QA Inspector' },
  { sl: 30, name: 'Riazul Zannat', employeeId: '40558', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
  { sl: 31, name: 'Md. Hamidul Islam', employeeId: '63923', department: 'QM', section: 'PCB', status: 'Active', designation: 'QA Inspector' },
];
